import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseOAuthCallback } from '../lib/oauth-callback';

const mockCreateURL = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockExchangeCodeForSession = jest.fn();

jest.mock('expo-linking', () => ({
  createURL: (...args: unknown[]) => mockCreateURL(...args),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args: unknown[]) =>
    mockOpenAuthSessionAsync(...args),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...args: unknown[]) =>
        mockExchangeCodeForSession(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

const { signInWithProvider } =
  require('../lib/auth-oauth') as typeof import('../lib/auth-oauth');

describe('social OAuth callback parser', () => {
  it('extracts a one-time authorization code from a PKCE callback', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?code=authorization-code',
      ),
    ).toEqual({ status: 'success', code: 'authorization-code' });
  });

  it('treats provider access denial as cancellation', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?error=access_denied&error_description=cancelled',
      ),
    ).toEqual({ status: 'cancelled' });
  });

  it.each([
    'nutritionhandbook://auth/callback',
    'nutritionhandbook://auth/callback?error=server_error',
    'nutritionhandbook://auth/callback#access_token=access&refresh_token=refresh',
  ])('rejects an unsafe or incomplete callback: %s', (url) => {
    expect(parseOAuthCallback(url)).toEqual({ status: 'error' });
  });
});

describe('native social OAuth orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateURL.mockReturnValue('nutritionhandbook://auth/callback');
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://provider.example/oauth' },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'nutritionhandbook://auth/callback?code=authorization-code',
    });
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it('exchanges exactly the callback authorization code', async () => {
    await expect(signInWithProvider('google')).resolves.toEqual({
      status: 'success',
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        queryParams: { prompt: 'consent' },
        redirectTo: 'nutritionhandbook://auth/callback',
        skipBrowserRedirect: true,
      },
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://provider.example/oauth',
      'nutritionhandbook://auth/callback',
      { showInRecents: true },
    );
    expect(mockExchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith(
      'authorization-code',
    );
  });

  it('returns cancellation when the browser is dismissed', async () => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' });

    await expect(signInWithProvider('facebook')).resolves.toEqual({
      status: 'cancelled',
    });
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('returns cancellation when the provider denies access', async () => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: 'nutritionhandbook://auth/callback?error=access_denied',
    });

    await expect(signInWithProvider('facebook')).resolves.toEqual({
      status: 'cancelled',
    });
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it.each([
    'nutritionhandbook://auth/callback',
    'nutritionhandbook://auth/callback?error=server_error',
  ])('rejects an incomplete provider callback: %s', async (url) => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url,
    });

    await expect(signInWithProvider('google')).rejects.toThrow(
      'OAuth callback is incomplete.',
    );
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('propagates a Supabase code-exchange failure', async () => {
    const exchangeError = new Error('exchange failed');
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: exchangeError });

    await expect(signInWithProvider('google')).rejects.toBe(exchangeError);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith(
      'authorization-code',
    );
  });
});

describe('social OAuth source safety', () => {
  it('supports exactly Google and Facebook without installing URL tokens', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'auth-oauth.ts'), 'utf8');
    const typesSource = readFileSync(join(root, 'types', 'auth.ts'), 'utf8');

    expect(typesSource).toContain("'google' | 'facebook'");
    expect(nativeSource).toContain('skipBrowserRedirect: true');
    expect(nativeSource).toContain('openAuthSessionAsync');
    expect(nativeSource).toContain('exchangeCodeForSession');
    expect(nativeSource).not.toContain('setSession');
    expect(nativeSource).not.toContain('access_token');
    expect(nativeSource).not.toContain('refresh_token');
    expect(nativeSource).not.toContain('console.log');
    expect(nativeSource).not.toContain('console.debug');
  });
});
