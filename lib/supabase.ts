import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

import { syncAuthRefresh } from './auth-refresh-lifecycle';
import { createChunkedStorageAdapter } from './chunked-secure-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

const secureStorage = createChunkedStorageAdapter({
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        lock: processLock,
      },
    })
  : null;

if (supabase) {
  syncAuthRefresh(supabase.auth, AppState.currentState);

  AppState.addEventListener('change', (state) => {
    syncAuthRefresh(supabase.auth, state);
  });
}
