import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import type {
  OAuthTokens,
  SocialAuthProvider,
  SocialAuthResult,
} from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

export function extractOAuthTokens(url: string): OAuthTokens | null {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.hash.slice(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function signInWithProvider(
  provider: SocialAuthProvider,
): Promise<SocialAuthResult> {
  const redirectTo = Linking.createURL('auth/callback');
  const queryParams = provider === 'google' ? { prompt: 'consent' } : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('OAuth URL is unavailable.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type !== 'success') {
    return { status: 'cancelled' };
  }

  const tokens = extractOAuthTokens(result.url);

  if (!tokens) {
    throw new Error('OAuth callback is incomplete.');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (sessionError) {
    throw sessionError;
  }

  return { status: 'success' };
}