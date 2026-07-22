import { createClient } from '@supabase/supabase-js';
import {
  deleteItemAsync,
  getItemAsync,
  setItemAsync,
} from 'expo-secure-store';
import { AppState } from 'react-native';

import { syncAuthRefresh } from '@/lib/auth-refresh-lifecycle';
import { createChunkedStorageAdapter } from '@/lib/chunked-secure-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

const ExpoSecureStoreAdapter = createChunkedStorageAdapter({
  getItem: (key: string) => getItemAsync(key),
  setItem: (key: string, value: string) => setItemAsync(key, value),
  removeItem: (key: string) => deleteItemAsync(key),
});

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

syncAuthRefresh(supabase.auth, AppState.currentState);
AppState.addEventListener('change', (state) => {
  syncAuthRefresh(supabase.auth, state);
});
