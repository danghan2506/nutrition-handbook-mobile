type SecureStorageDriver = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type StorageManifest = {
  chunks: number;
  generation: string;
  version: 1;
};

const CHUNK_CODE_POINTS = 400;
let generationCounter = 0;

function defaultGeneration() {
  generationCounter += 1;

  return `${Date.now().toString(36)}-${generationCounter.toString(36)}`;
}

function getManifestKey(key: string) {
  return `${key}.manifest`;
}

function getChunkKey(key: string, manifest: StorageManifest, index: number) {
  return `${key}.chunk.${manifest.generation}.${index}`;
}

function parseManifest(value: string | null): StorageManifest | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      parsed.version === 1 &&
      'generation' in parsed &&
      typeof parsed.generation === 'string' &&
      'chunks' in parsed &&
      typeof parsed.chunks === 'number' &&
      Number.isInteger(parsed.chunks) &&
      parsed.chunks > 0
    ) {
      return parsed as StorageManifest;
    }
  } catch {
    return null;
  }

  return null;
}

function splitIntoChunks(value: string) {
  const codePoints = Array.from(value);
  const chunks: string[] = [];

  for (let index = 0; index < codePoints.length; index += CHUNK_CODE_POINTS) {
    chunks.push(codePoints.slice(index, index + CHUNK_CODE_POINTS).join(''));
  }

  return chunks.length > 0 ? chunks : [''];
}

async function removeChunks(
  driver: SecureStorageDriver,
  key: string,
  manifest: StorageManifest,
) {
  await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      driver.removeItem(getChunkKey(key, manifest, index)),
    ),
  );
}

export function createChunkedStorageAdapter(
  driver: SecureStorageDriver,
  createGeneration: () => string = defaultGeneration,
) {
  return {
    async getItem(key: string) {
      const manifest = parseManifest(
        await driver.getItem(getManifestKey(key)),
      );

      if (!manifest) {
        return driver.getItem(key);
      }

      const chunks = await Promise.all(
        Array.from({ length: manifest.chunks }, (_, index) =>
          driver.getItem(getChunkKey(key, manifest, index)),
        ),
      );

      return chunks.some((chunk) => chunk === null)
        ? null
        : (chunks as string[]).join('');
    },

    async setItem(key: string, value: string) {
      const oldManifest = parseManifest(
        await driver.getItem(getManifestKey(key)),
      );
      const chunks = splitIntoChunks(value);
      const nextManifest: StorageManifest = {
        chunks: chunks.length,
        generation: createGeneration(),
        version: 1,
      };
      const writtenKeys: string[] = [];

      try {
        for (const [index, chunk] of chunks.entries()) {
          const chunkKey = getChunkKey(key, nextManifest, index);
          await driver.setItem(chunkKey, chunk);
          writtenKeys.push(chunkKey);
        }

        await driver.setItem(
          getManifestKey(key),
          JSON.stringify(nextManifest),
        );
      } catch (error: unknown) {
        await Promise.allSettled(
          writtenKeys.map((chunkKey) => driver.removeItem(chunkKey)),
        );
        throw error;
      }

      await Promise.allSettled([
        driver.removeItem(key),
        ...(oldManifest && oldManifest.generation !== nextManifest.generation
          ? [
              ...Array.from({ length: oldManifest.chunks }, (_, index) =>
                driver.removeItem(getChunkKey(key, oldManifest, index)),
              ),
            ]
          : []),
      ]);
    },

    async removeItem(key: string) {
      const manifest = parseManifest(
        await driver.getItem(getManifestKey(key)),
      );

      if (manifest) {
        await removeChunks(driver, key, manifest);
      }

      await Promise.all([
        driver.removeItem(getManifestKey(key)),
        driver.removeItem(key),
      ]);
    },
  };
}
