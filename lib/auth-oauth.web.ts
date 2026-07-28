import * as Linking from 'expo-linking';

import { supabase } from './supabase';

export type SocialProvider = 'google' | 'facebook';

export type OAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'configuration' }
  | { status: 'error' };

export async function signInWithProvider(
  provider: SocialProvider,
): Promise<OAuthResult> {
  if (!supabase) {
    return { status: 'configuration' };
  }

  try {
    const redirectTo = Linking.createURL('auth/callback');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    return error ? { status: 'error' } : { status: 'success' };
  } catch {
    return { status: 'error' };
  }
}
