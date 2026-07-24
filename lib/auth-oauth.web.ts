import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import type {
  SocialAuthProvider,
  SocialAuthResult,
} from '@/types/auth';

export async function signInWithProvider(
  provider: SocialAuthProvider,
): Promise<SocialAuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: Linking.createURL('/login'),
    },
  });

  if (error) {
    throw error;
  }

  return { status: 'redirected' };
}