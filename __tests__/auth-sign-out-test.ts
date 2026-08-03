import { signOutCurrentUser } from '../lib/auth';

function createAuthClient() {
  return {
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  };
}

describe('sign out authentication', () => {
  it('signs out the active Supabase session', async () => {
    const client = createAuthClient();

    await expect(signOutCurrentUser(client)).resolves.toEqual({ ok: true });

    expect(client.auth.signOut).toHaveBeenCalledWith();
  });

  it('reports missing local configuration without throwing', async () => {
    await expect(signOutCurrentUser(null)).resolves.toMatchObject({
      ok: false,
      reason: 'not_configured',
    });
  });

  it('maps Supabase sign out errors to calm Vietnamese feedback', async () => {
    const client = createAuthClient();
    client.auth.signOut.mockResolvedValueOnce({
      error: new Error('network details'),
    });

    await expect(signOutCurrentUser(client)).resolves.toEqual({
      ok: false,
      reason: 'sign_out_failed',
      message: 'Chưa thể đăng xuất lúc này. Bạn vui lòng thử lại sau một chút.',
    });
  });
});
