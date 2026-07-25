import type { OAuthCallbackResult } from '@/types/auth';

export function parseOAuthCallback(url: string): OAuthCallbackResult {
  const params = new URL(url).searchParams;
  const error = params.get('error');

  if (error === 'access_denied') {
    return { status: 'cancelled' };
  }

  if (error) {
    return { status: 'error' };
  }

  const code = params.get('code');

  if (!code) {
    return { status: 'error' };
  }

  return { status: 'success', code };
}
