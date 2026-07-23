import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { parseOAuthCallback } from '@/lib/oauth-callback';
import { supabase } from '@/lib/supabase';
import type {
  SocialAuthProvider,
  SocialAuthResult,
} from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

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

  const callback = parseOAuthCallback(result.url);

  if (callback.status === 'cancelled') {
    return callback;
  }

  if (callback.status === 'error') {
    throw new Error('OAuth callback is incomplete.');
  }

  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(callback.code);

  if (sessionError) {
    throw sessionError;
  }

  return { status: 'success' };
}
