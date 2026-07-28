import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

export type SocialProvider = 'google' | 'facebook';

export type OAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'configuration' }
  | { status: 'error' };

WebBrowser.maybeCompleteAuthSession();

function getHashParameters(url: string) {
  const hash = url.split('#')[1];

  if (!hash) {
    return new URLSearchParams();
  }

  return new URLSearchParams(hash);
}

async function completeOAuthCallback(url: string): Promise<OAuthResult> {
  if (!supabase) {
    return { status: 'configuration' };
  }

  const parsed = Linking.parse(url);
  const code =
    typeof parsed.queryParams?.code === 'string'
      ? parsed.queryParams.code
      : null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? { status: 'error' } : { status: 'success' };
  }

  const hash = getHashParameters(url);
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return error ? { status: 'error' } : { status: 'success' };
  }

  return { status: 'error' };
}

export async function signInWithProvider(
  provider: SocialProvider,
): Promise<OAuthResult> {
  if (!supabase) {
    return { status: 'configuration' };
  }

  const redirectTo = Linking.createURL('auth/callback');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { status: 'error' };
    }

    const browserResult = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
    );

    if (browserResult.type !== 'success') {
      return { status: 'cancelled' };
    }

    return completeOAuthCallback(browserResult.url);
  } catch {
    return { status: 'error' };
  }
}
