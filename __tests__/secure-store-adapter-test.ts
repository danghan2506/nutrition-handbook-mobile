import { createChunkedStorageAdapter } from '../lib/chunked-secure-storage';

type MemoryDriver = {
  values: Map<string, string>;
  failOnWrite: null | number;
  writes: number;
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function createMemoryDriver(): MemoryDriver {
  const values = new Map<string, string>();

  return {
    values,
    failOnWrite: null,
    writes: 0,
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      this.writes += 1;

      if (this.failOnWrite === this.writes) {
        throw new Error('write failed');
      }

      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}

describe('chunked secure storage', () => {
  it('round-trips sessions larger than a single SecureStore value', async () => {
    const driver = createMemoryDriver();
    const adapter = createChunkedStorageAdapter(driver, () => 'generation-a');
    const value = JSON.stringify({
      access_token: 'a'.repeat(5000),
      user: { name: 'Người dùng Aurale' },
    });

    await adapter.setItem('session', value);

    await expect(adapter.getItem('session')).resolves.toBe(value);
    expect(
      [...driver.values.values()].every((stored) => stored.length <= 500),
    ).toBe(true);
  });

  it('keeps the previous session if a replacement write fails', async () => {
    const driver = createMemoryDriver();
    let generation = 0;
    const adapter = createChunkedStorageAdapter(
      driver,
      () => `generation-${++generation}`,
    );

    await adapter.setItem('session', 'old-session');
    driver.failOnWrite = driver.writes + 2;

    await expect(
      adapter.setItem('session', 'new-session'.repeat(500)),
    ).rejects.toThrow('write failed');
    await expect(adapter.getItem('session')).resolves.toBe('old-session');
  });

  it('reads and removes a session saved by the legacy single-value adapter', async () => {
    const driver = createMemoryDriver();
    const adapter = createChunkedStorageAdapter(driver, () => 'generation-a');
    driver.values.set('session', 'legacy-session');

    await expect(adapter.getItem('session')).resolves.toBe('legacy-session');

    await adapter.removeItem('session');

    expect(driver.values.size).toBe(0);
  });
});
