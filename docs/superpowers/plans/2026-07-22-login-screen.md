# AURALE Login Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved mandatory Google/Facebook login screen between onboarding and the signed-in tabs, backed by Supabase Auth with mobile sessions stored in Expo SecureStore.

**Architecture:** Keep the screen and provider button presentation in React Native, place Supabase client setup and OAuth orchestration in `lib/`, and use a focused route-level session hook rather than a new global store. Native OAuth opens an Expo WebBrowser auth session and exchanges returned access/refresh tokens with Supabase; web lets Supabase perform the browser redirect. Startup routing combines persisted onboarding state with the persisted Supabase session.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, React 19.1.0, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, Supabase JS, Expo SecureStore, Expo WebBrowser, Expo Linking, Jest.

## Global Constraints

- Follow Expo SDK 54 APIs only: `https://docs.expo.dev/versions/v54.0.0/`.
- NativeWind is `^5.0.0-preview.4`; follow `https://www.nativewind.dev/v5/llms-full.txt` and do not upgrade it.
- Install only the approved packages: `@supabase/supabase-js` and `expo-secure-store`.
- Keep the existing `nutritionhandbook` app scheme.
- Use exact copy: `Chào mừng bạn quay trở lại.`
- Show only `Tiếp tục với Google` and `Tiếp tục với Facebook`; no email, password, guest, or skip action.
- Show the AURALE wordmark without the removed circular logo.
- Never render the mockup companion's `Connected` label.
- Store native Supabase session tokens in SecureStore; keep AsyncStorage limited to onboarding state and use Supabase's browser storage behavior on web.
- Never place Google/Facebook client secrets, Supabase secret keys, or service-role keys in the mobile client.
- Do not create database tables, profiles, RLS policies, analytics, or health-data persistence.
- Preserve unrelated changes and leave the existing untracked `tmp/` directory untouched.

---

## File map

- `.env.example` — public runtime configuration contract; contains no real credentials.
- `app.json` — registers SecureStore and WebBrowser config plugins while preserving the existing scheme.
- `lib/supabase.ts` — native Supabase client using SecureStore.
- `lib/supabase.web.ts` — web Supabase client using browser-compatible persisted storage.
- `types/auth.ts` — shared provider and result types.
- `lib/auth-oauth.ts` — native OAuth browser flow and callback token parsing.
- `lib/auth-oauth.web.ts` — web OAuth redirect flow.
- `hooks/use-auth-session.ts` — small route-gate hook driven by Supabase session events.
- `constants/auth.ts` — approved Vietnamese labels and calm error copy.
- `components/auth/social-login-button.tsx` — reusable accessible provider button.
- `app/login.tsx` — approved Calm social screen and interaction states.
- `app/index.tsx` — startup session lookup plus initial redirect.
- `app/onboarding.tsx` — completes onboarding into login.
- `app/_layout.tsx` — registers the login route.
- `app/(tabs)/_layout.tsx` — blocks unauthenticated direct access.
- `lib/onboarding-storage.ts` — chooses onboarding, login, or tabs from onboarding and session state.
- `__tests__/auth-config-test.ts` — dependency, plugin, environment, and client-storage contract.
- `__tests__/auth-oauth-test.ts` — callback parsing and provider contract.
- `__tests__/login-content-test.ts` — exact copy, methods, visual exclusions, and accessibility source contract.
- `__tests__/login-navigation-test.ts` — startup, onboarding completion, stack registration, and tabs guard.

---

### Task 1: Add the approved authentication dependencies and app configuration

**Files:**
- Create: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app.json`
- Create: `__tests__/auth-config-test.ts`

**Interfaces:**
- Consumes: existing Expo scheme `nutritionhandbook` and installed `expo-web-browser`.
- Produces: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_TERMS_URL`, and `EXPO_PUBLIC_PRIVACY_URL` runtime variables; installed Supabase and SecureStore packages.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('authentication configuration', () => {
  it('declares the approved dependencies, plugins, scheme, and public variables', () => {
    const root = process.cwd();
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
    const envExample = readFileSync(join(root, '.env.example'), 'utf8');

    expect(packageJson.dependencies['@supabase/supabase-js']).toBeTruthy();
    expect(packageJson.dependencies['expo-secure-store']).toBe('~15.0.8');
    expect(appJson.expo.scheme).toBe('nutritionhandbook');
    expect(appJson.expo.plugins).toContain('expo-secure-store');
    expect(appJson.expo.plugins).toContainEqual([
      'expo-web-browser',
      { experimentalLauncherActivity: false },
    ]);
    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_URL=');
    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=');
    expect(envExample).toContain('EXPO_PUBLIC_TERMS_URL=');
    expect(envExample).toContain('EXPO_PUBLIC_PRIVACY_URL=');
  });
});
```

- [ ] **Step 2: Run the test and verify the dependency contract fails**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`

Expected: FAIL because `.env.example`, `@supabase/supabase-js`, and `expo-secure-store` do not exist yet.

- [ ] **Step 3: Install the approved Expo-compatible packages**

Run: `npx expo install @supabase/supabase-js expo-secure-store`

Expected: `package.json` and `package-lock.json` contain the SDK-compatible versions, with `expo-secure-store` resolved to `~15.0.8`.

- [ ] **Step 4: Add the environment contract**

Create `.env.example` exactly as:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_TERMS_URL=
EXPO_PUBLIC_PRIVACY_URL=
```

Only the Supabase project URL and publishable key are allowed in the app environment. Provider client secrets stay in Google/Facebook and Supabase dashboards.

- [ ] **Step 5: Register the Expo config plugins**

Keep the existing router and splash plugins, then append these entries to `app.json`:

```json
"expo-secure-store",
[
  "expo-web-browser",
  {
    "experimentalLauncherActivity": false
  }
]
```

Do not change `"scheme": "nutritionhandbook"`.

- [ ] **Step 6: Re-run the focused test**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the configuration unit**

```bash
git add .env.example app.json package.json package-lock.json __tests__/auth-config-test.ts
git commit -m "chore: configure Supabase social auth"
```

---

### Task 2: Create platform-specific Supabase clients with secure native persistence

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/supabase.web.ts`
- Modify: `__tests__/auth-config-test.ts`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `expo-secure-store`.
- Produces: `supabase: SupabaseClient` from both platform files under the shared `@/lib/supabase` import.

- [ ] **Step 1: Extend the failing test with client security assertions**

Add this test:

```ts
it('uses SecureStore natively and browser storage on web without secret keys', () => {
  const root = process.cwd();
  const nativeSource = readFileSync(join(root, 'lib', 'supabase.ts'), 'utf8');
  const webSource = readFileSync(join(root, 'lib', 'supabase.web.ts'), 'utf8');

  expect(nativeSource).toContain("from 'expo-secure-store'");
  expect(nativeSource).toContain('ExpoSecureStoreAdapter');
  expect(nativeSource).toContain('persistSession: true');
  expect(nativeSource).toContain('detectSessionInUrl: false');
  expect(webSource).toContain('persistSession: true');
  expect(webSource).toContain('detectSessionInUrl: true');
  expect(`${nativeSource}\n${webSource}`).not.toContain('service_role');
  expect(`${nativeSource}\n${webSource}`).not.toContain('SUPABASE_SECRET');
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`

Expected: FAIL because the platform client files are missing.

- [ ] **Step 3: Implement the native SecureStore client**

Create `lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import {
  deleteItemAsync,
  getItemAsync,
  setItemAsync,
} from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => getItemAsync(key),
  setItem: (key: string, value: string) => setItemAsync(key, value),
  removeItem: (key: string) => deleteItemAsync(key),
};

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
```

Do not log keys, callback parameters, access tokens, refresh tokens, or session objects.

- [ ] **Step 4: Implement the web client**

Create `lib/supabase.web.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
```

The web client uses Supabase's browser storage behavior. SecureStore is native-only.

- [ ] **Step 5: Run the focused test and type checker**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit the client unit**

```bash
git add lib/supabase.ts lib/supabase.web.ts __tests__/auth-config-test.ts
git commit -m "feat: add secure Supabase clients"
```

---

### Task 3: Implement the Google/Facebook OAuth service

**Files:**
- Create: `types/auth.ts`
- Create: `lib/auth-oauth.ts`
- Create: `lib/auth-oauth.web.ts`
- Create: `__tests__/auth-oauth-test.ts`

**Interfaces:**
- Consumes: `supabase`, Expo Linking, Expo WebBrowser, app scheme `nutritionhandbook`.
- Produces: `signInWithProvider(provider: SocialAuthProvider): Promise<SocialAuthResult>` and `extractOAuthTokens(url: string): OAuthTokens | null` on native.

- [ ] **Step 1: Write the failing callback and provider tests**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { extractOAuthTokens } from '../lib/auth-oauth';

describe('social OAuth', () => {
  it('extracts the Supabase session tokens from the callback fragment', () => {
    expect(
      extractOAuthTokens(
        'nutritionhandbook://auth/callback#access_token=access-123&refresh_token=refresh-456',
      ),
    ).toEqual({ accessToken: 'access-123', refreshToken: 'refresh-456' });
  });

  it('rejects callbacks that do not contain both tokens', () => {
    expect(
      extractOAuthTokens(
        'nutritionhandbook://auth/callback#access_token=access-123',
      ),
    ).toBeNull();
  });

  it('supports exactly Google and Facebook without logging tokens', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'auth-oauth.ts'), 'utf8');
    const typesSource = readFileSync(join(root, 'types', 'auth.ts'), 'utf8');

    expect(typesSource).toContain("'google' | 'facebook'");
    expect(nativeSource).toContain('skipBrowserRedirect: true');
    expect(nativeSource).toContain('openAuthSessionAsync');
    expect(nativeSource).toContain('supabase.auth.setSession');
    expect(nativeSource).not.toContain('console.log');
    expect(nativeSource).not.toContain('console.debug');
  });
});
```

- [ ] **Step 2: Run the OAuth test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/auth-oauth-test.ts`

Expected: FAIL because the auth types and OAuth service do not exist.

- [ ] **Step 3: Define the shared types**

Create `types/auth.ts`:

```ts
export type SocialAuthProvider = 'google' | 'facebook';

export type SocialAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'redirected' };

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
};
```

- [ ] **Step 4: Implement the native OAuth flow**

Create `lib/auth-oauth.ts`:

```ts
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
```

- [ ] **Step 5: Implement the web redirect flow**

Create `lib/auth-oauth.web.ts`:

```ts
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
```

- [ ] **Step 6: Run the OAuth tests and type checker**

Run: `npm test -- --runTestsByPath __tests__/auth-oauth-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 7: Commit the OAuth unit**

```bash
git add types/auth.ts lib/auth-oauth.ts lib/auth-oauth.web.ts __tests__/auth-oauth-test.ts
git commit -m "feat: add social OAuth flow"
```

---

### Task 4: Build the approved Calm social login screen

**Files:**
- Create: `constants/auth.ts`
- Create: `components/auth/social-login-button.tsx`
- Create: `app/login.tsx`
- Create: `__tests__/login-content-test.ts`

**Interfaces:**
- Consumes: `signInWithProvider`, `SocialAuthProvider`, theme utilities from `global.css`, and public legal URLs.
- Produces: `/login` route and `SocialLoginButton` with loading, disabled, provider, label, and press props.

- [ ] **Step 1: Write the failing content and accessibility contract**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('approved login screen', () => {
  it('uses the approved copy, methods, wordmark, and interaction states', () => {
    const root = process.cwd();
    const screen = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const button = readFileSync(
      join(root, 'components', 'auth', 'social-login-button.tsx'),
      'utf8',
    );
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');

    expect(copy).toContain('Chào mừng bạn quay trở lại.');
    expect(copy).toContain('Tiếp tục với Google');
    expect(copy).toContain('Tiếp tục với Facebook');
    expect(copy).toContain('Chưa thể đăng nhập. Vui lòng thử lại.');
    expect(copy).toContain('Cần kết nối internet để đăng nhập.');
    expect(screen).toContain('AURALE');
    expect(screen).toContain("signInWithProvider('google')");
    expect(screen).toContain("signInWithProvider('facebook')");
    expect(screen).not.toContain('Connected');
    expect(screen).not.toContain('Bỏ qua');
    expect(screen).not.toContain('Email');
    expect(button).toContain('accessibilityRole="button"');
    expect(button).toContain('accessibilityState');
    expect(button).toContain('min-h-[54px]');
    expect(button).toContain('useReducedMotion');
    expect(screen).toContain('max-w-[520px]');
    expect(screen).toContain('min-h-11');
  });
});
```

- [ ] **Step 2: Run the login content test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/login-content-test.ts`

Expected: FAIL because the screen, button, and copy files are missing.

- [ ] **Step 3: Add the approved copy constants**

Create `constants/auth.ts`:

```ts
export const loginCopy = {
  brand: 'AURALE',
  title: 'Chào mừng bạn quay trở lại.',
  body: 'Đăng nhập để lưu lại bữa ăn, thói quen và những ghi chú sức khỏe quan trọng.',
  google: 'Tiếp tục với Google',
  facebook: 'Tiếp tục với Facebook',
  loading: 'Đang kết nối…',
  genericError: 'Chưa thể đăng nhập. Vui lòng thử lại.',
  offlineError: 'Cần kết nối internet để đăng nhập.',
  legalPrefix: 'Bằng việc tiếp tục, bạn đồng ý với',
  terms: 'Điều khoản',
  privacy: 'Chính sách quyền riêng tư',
} as const;
```

- [ ] **Step 4: Build the reusable provider button**

Create `components/auth/social-login-button.tsx`:

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { SocialAuthProvider } from '@/types/auth';

type SocialLoginButtonProps = {
  disabled: boolean;
  label: string;
  loading: boolean;
  onPress: () => void;
  provider: SocialAuthProvider;
};

const providerColor: Record<SocialAuthProvider, string> = {
  google: '#4285F4',
  facebook: '#1877F2',
};

export function SocialLoginButton({
  disabled,
  label,
  loading,
  onPress,
  provider,
}: SocialLoginButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      className={`min-h-[54px] flex-row items-center rounded-[17px] border border-quiet-dot bg-surface px-3 ${
        disabled ? 'opacity-60' : ''
      }`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [
          { scale: pressed && !reduceMotion ? 0.98 : 1 },
          { translateY: pressed && !reduceMotion ? 1 : 0 },
        ],
      })}>
      <View className="w-9 items-start">
        <FontAwesome
          color={providerColor[provider]}
          name={provider}
          size={22}
        />
      </View>
      <Text className="flex-1 text-center font-sans text-[15px] font-bold text-ink-navy">
        {label}
      </Text>
      <View className="w-9 items-end">
        {loading ? (
          <ActivityIndicator color="#697386" size="small" />
        ) : (
          <FontAwesome color="#A69D94" name="angle-right" size={18} />
        )}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 5: Build the screen with real interaction states**

Create `app/login.tsx` with these behaviors:

```tsx
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SocialLoginButton } from '@/components/auth/social-login-button';
import { loginCopy } from '@/constants/auth';
import { signInWithProvider } from '@/lib/auth-oauth';
import type { SocialAuthProvider } from '@/types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [activeProvider, setActiveProvider] =
    useState<SocialAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openLegalUrl = async (url: string | undefined) => {
    if (!url) {
      setErrorMessage(loginCopy.genericError);
      return;
    }

    await Linking.openURL(url);
  };

  const login = async (provider: SocialAuthProvider) => {
    setActiveProvider(provider);
    setErrorMessage(null);

    try {
      const result = await signInWithProvider(provider);

      if (result.status === 'success') {
        router.replace('/(tabs)');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      setErrorMessage(
        /network|fetch|internet/i.test(message)
          ? loginCopy.offlineError
          : loginCopy.genericError,
      );
    } finally {
      setActiveProvider(null);
    }
  };

  const isBusy = activeProvider !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-[520px] flex-1 self-center px-5 pb-5 pt-4">
          <View className="absolute -right-16 top-36 h-48 w-48 rounded-full bg-butter/30" />
          <View className="absolute right-20 top-32 h-9 w-9 rounded-full bg-sky/60" />
          <View className="absolute right-20 top-72 h-24 w-24 rounded-full bg-leaf/30" />

          <Text className="font-sans text-[15px] font-extrabold tracking-[2px] text-ink-navy">
            {loginCopy.brand}
          </Text>

          <View className="mt-24 max-w-[310px]">
            <Text className="font-rounded text-[32px] font-extrabold leading-[38px] tracking-[-0.7px] text-ink-navy">
              {loginCopy.title}
            </Text>
            <Text className="mt-4 font-sans text-[16px] leading-6 text-soft-slate">
              {loginCopy.body}
            </Text>
          </View>

          <View className="mt-auto gap-3 pt-12">
            <SocialLoginButton
              disabled={isBusy}
              label={activeProvider === 'google' ? loginCopy.loading : loginCopy.google}
              loading={activeProvider === 'google'}
              onPress={() => void login('google')}
              provider="google"
            />
            <SocialLoginButton
              disabled={isBusy}
              label={activeProvider === 'facebook' ? loginCopy.loading : loginCopy.facebook}
              loading={activeProvider === 'facebook'}
              onPress={() => void login('facebook')}
              provider="facebook"
            />

            {errorMessage ? (
              <Text accessibilityLiveRegion="polite" className="text-center text-[14px] text-coral-notice">
                {errorMessage}
              </Text>
            ) : null}

            <Text className="px-3 text-center text-[12px] leading-[18px] text-soft-slate">
              {loginCopy.legalPrefix}
            </Text>
            <View className="flex-row flex-wrap items-center justify-center">
              <Pressable
                accessibilityLabel={loginCopy.terms}
                accessibilityRole="link"
                className="min-h-11 justify-center px-2"
                onPress={() => void openLegalUrl(process.env.EXPO_PUBLIC_TERMS_URL)}>
                <Text className="text-[12px] font-bold text-ink-navy underline">
                  {loginCopy.terms}
                </Text>
              </Pressable>
              <Text className="text-[12px] text-soft-slate">và</Text>
              <Pressable
                accessibilityLabel={loginCopy.privacy}
                accessibilityRole="link"
                className="min-h-11 justify-center px-2"
                onPress={() => void openLegalUrl(process.env.EXPO_PUBLIC_PRIVACY_URL)}>
                <Text className="text-[12px] font-bold text-ink-navy underline">
                  {loginCopy.privacy}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

If NativeWind preview rejects opacity suffix utilities such as `bg-butter/30`, replace only those three dynamic translucent decoration backgrounds with permitted inline RGBA colors. Keep ordinary layout styling in NativeWind.

- [ ] **Step 6: Add the missing Coral Notice token if the class is unavailable**

In `global.css`, add this exact theme token only if `text-coral-notice` fails compilation:

```css
--color-coral-notice: #FF8B78;
```

- [ ] **Step 7: Run the focused test, type checker, and lint**

Run: `npm test -- --runTestsByPath __tests__/login-content-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 8: Commit the screen unit**

```bash
git add app/login.tsx components/auth/social-login-button.tsx constants/auth.ts global.css __tests__/login-content-test.ts
git commit -m "feat: add calm social login screen"
```

---

### Task 5: Connect onboarding, startup routing, and protected tabs

**Files:**
- Create: `hooks/use-auth-session.ts`
- Modify: `lib/onboarding-storage.ts`
- Modify: `app/index.tsx`
- Modify: `app/onboarding.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `__tests__/onboarding-storage-test.ts`
- Modify: `__tests__/onboarding-navigation-test.ts`
- Create: `__tests__/login-navigation-test.ts`

**Interfaces:**
- Consumes: `supabase.auth.getSession()`, `supabase.auth.onAuthStateChange()`, persisted onboarding state.
- Produces: `getInitialRoute(hasSession: boolean): Promise<'/onboarding' | '/login' | '/(tabs)'>` and `useAuthSession(): { isLoading: boolean; session: Session | null }`.

- [ ] **Step 1: Update the storage tests to describe the three startup destinations**

Replace the second test in `__tests__/onboarding-storage-test.ts` with:

```ts
it('opens login after onboarding when no session exists', async () => {
  await markOnboardingCompleted();

  await expect(readOnboardingCompleted()).resolves.toBe(true);
  await expect(getInitialRoute(false)).resolves.toBe('/login');
});

it('opens the main tabs after onboarding when a session exists', async () => {
  await markOnboardingCompleted();

  await expect(getInitialRoute(true)).resolves.toBe('/(tabs)');
});
```

Update the first test call to `getInitialRoute(false)`.

- [ ] **Step 2: Write the failing navigation contract**

Create `__tests__/login-navigation-test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('mandatory login navigation', () => {
  it('routes onboarding to login and protects tabs with the Supabase session', () => {
    const root = process.cwd();
    const index = readFileSync(join(root, 'app', 'index.tsx'), 'utf8');
    const onboarding = readFileSync(join(root, 'app', 'onboarding.tsx'), 'utf8');
    const rootLayout = readFileSync(join(root, 'app', '_layout.tsx'), 'utf8');
    const tabsLayout = readFileSync(join(root, 'app', '(tabs)', '_layout.tsx'), 'utf8');
    const authHook = readFileSync(join(root, 'hooks', 'use-auth-session.ts'), 'utf8');

    expect(index).toContain('supabase.auth.getSession');
    expect(index).toContain('getInitialRoute(Boolean(session))');
    expect(onboarding).toContain("router.replace('/login')");
    expect(onboarding).not.toContain("router.replace('/(tabs)')");
    expect(rootLayout).toContain('<Stack.Screen name="login"');
    expect(tabsLayout).toContain('<Redirect href="/login" />');
    expect(authHook).toContain('supabase.auth.onAuthStateChange');
    expect(authHook).toContain('subscription.unsubscribe');
  });
});
```

- [ ] **Step 3: Run the routing tests and verify they fail**

Run: `npm test -- --runTestsByPath __tests__/onboarding-storage-test.ts __tests__/onboarding-navigation-test.ts __tests__/login-navigation-test.ts`

Expected: FAIL because onboarding still routes to tabs and no session guard exists.

- [ ] **Step 4: Make initial routing session-aware**

Change `getInitialRoute` in `lib/onboarding-storage.ts` to:

```ts
export async function getInitialRoute(
  hasSession: boolean,
): Promise<'/onboarding' | '/login' | '/(tabs)'> {
  if (!(await readOnboardingCompleted())) {
    return '/onboarding';
  }

  return hasSession ? '/(tabs)' : '/login';
}
```

In `app/index.tsx`, fetch the persisted session before selecting the route:

```ts
const {
  data: { session },
} = await supabase.auth.getSession();
return getInitialRoute(Boolean(session));
```

Keep the existing mounted guard and fallback. Change the fallback route from `/onboarding` only if onboarding-state reading fails; an auth lookup failure after completed onboarding must resolve to `/login`, never tabs.

- [ ] **Step 5: Route onboarding completion to login**

In `app/onboarding.tsx`, replace:

```ts
router.replace('/(tabs)');
```

with:

```ts
router.replace('/login');
```

Both the skip action and final slide continue to use the existing shared completion function.

- [ ] **Step 6: Add the focused auth-session hook**

Create `hooks/use-auth-session.ts`:

```ts
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, session };
}
```

- [ ] **Step 7: Register the login route and protect the tabs group**

Add this screen to `app/_layout.tsx`:

```tsx
<Stack.Screen name="login" options={{ headerShown: false }} />
```

At the beginning of `TabLayout` in `app/(tabs)/_layout.tsx`, call the hook and gate rendering:

```tsx
const { isLoading, session } = useAuthSession();

if (isLoading) {
  return null;
}

if (!session) {
  return <Redirect href="/login" />;
}
```

Import `Redirect` alongside `Tabs` and import `useAuthSession` from `@/hooks/use-auth-session`.

- [ ] **Step 8: Run all routing tests**

Run: `npm test -- --runTestsByPath __tests__/onboarding-storage-test.ts __tests__/onboarding-navigation-test.ts __tests__/login-navigation-test.ts`

Expected: PASS.

- [ ] **Step 9: Run the complete automated verification**

Run: `npm test`

Expected: every Jest suite passes.

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 10: Perform the device-level OAuth checks with real approved configuration**

Use a Supabase project where Google and Facebook are enabled and `nutritionhandbook://auth/callback` is present in the redirect allow list. Set local `.env` values for the project URL, publishable key, terms URL, and privacy URL; never commit `.env`.

Verify on Android and iOS:

1. Fresh install opens onboarding.
2. Skipping or completing onboarding opens login.
3. Back navigation cannot expose tabs.
4. Cancelling Google returns to idle without an alarming error.
5. Cancelling Facebook returns to idle without an alarming error.
6. Offline attempts show `Cần kết nối internet để đăng nhập.`
7. Successful Google login replaces login with tabs.
8. Successful Facebook login replaces login with tabs.
9. Relaunch with a persisted session opens tabs after completed onboarding.
10. Removing the session causes direct tabs access to redirect to login.
11. Large text does not clip the provider buttons or legal links.
12. Screen reader announces both provider buttons, busy state, errors, and legal links.

- [ ] **Step 11: Commit the routing integration**

```bash
git add app/index.tsx app/onboarding.tsx app/_layout.tsx "app/(tabs)/_layout.tsx" hooks/use-auth-session.ts lib/onboarding-storage.ts __tests__/onboarding-storage-test.ts __tests__/onboarding-navigation-test.ts __tests__/login-navigation-test.ts
git commit -m "feat: require login before app access"
```

---

## External configuration checklist

These are operational prerequisites, not mobile-client code:

- Use an existing or separately approved Supabase project.
- Enable Google and Facebook providers in Supabase Auth.
- Store Google and Facebook client secrets only in provider/Supabase dashboards.
- Add the Supabase callback URL to Google and Facebook provider consoles.
- Add `nutritionhandbook://auth/callback` to the Supabase redirect allow list.
- Configure real HTTPS terms and privacy URLs before release.
- Use only the Supabase project URL and publishable key in `EXPO_PUBLIC_*` variables.

## Final review gate

Before claiming completion, invoke `superpowers:verification-before-completion`, re-run `npm test`, `npx tsc --noEmit`, and `npm run lint`, then report the exact commands and outputs. Do not claim real OAuth success unless it was verified against configured Google and Facebook providers on a device or simulator.
