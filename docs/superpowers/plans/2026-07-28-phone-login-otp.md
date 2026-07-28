# AURALE Phone Login and OTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved phone-first login and OTP flow, keep Google/Facebook alternatives, persist Supabase sessions securely, and route authenticated users directly to the main tabs.

**Architecture:** Add an `(auth)` route group for login and OTP screens, keep phone formatting and Auth API calls in focused `lib/` modules, and observe the persisted Supabase session through one hook used by startup and tab guards. Supabase test phone numbers and fixed OTP codes remain dashboard-only; the client uses the same `signInWithOtp` and `verifyOtp` calls as production.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, React 19.1, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, Supabase JS, Expo SecureStore, Expo WebBrowser, Expo Linking, Jest.

## Global Constraints

- Follow Expo SDK 54 APIs only: `https://docs.expo.dev/versions/v54.0.0/`.
- Keep NativeWind at `^5.0.0-preview.4` and use the existing `components/ui/tw.tsx` wrappers where a React Native primitive needs `className` support.
- Install only the already approved Auth dependencies: `@supabase/supabase-js` and `expo-secure-store`.
- Preserve the existing app scheme `nutritionhandbook`.
- Keep the current route decision: `Onboarding → Login → OTP verification → Main tabs`.
- Defer the three-step profile setup flow; remind the user and request a new navigation/persistence decision before implementing it.
- Never commit Supabase secrets, provider secrets, test phone numbers, fixed OTP codes, access tokens, or refresh tokens.
- Do not add account linking, Zustand, profile storage, database tables, RLS policies, analytics, or health-data persistence.
- Preserve unrelated `package.json`, `package-lock.json`, and `tmp/` changes.

---

### Task 1: Configure Supabase and secure native session persistence

**Files:**
- Create: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app.json`
- Create: `lib/supabase.ts`
- Create: `lib/supabase.web.ts`
- Create: `__tests__/auth-config-test.ts`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, existing scheme `nutritionhandbook`.
- Produces: `supabase: SupabaseClient | null`, `isSupabaseConfigured: boolean` from `@/lib/supabase` on native and web.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Supabase auth configuration', () => {
  it('declares approved dependencies and public environment variables', () => {
    const root = process.cwd();
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const env = readFileSync(join(root, '.env.example'), 'utf8');
    const nativeClient = readFileSync(join(root, 'lib', 'supabase.ts'), 'utf8');

    expect(pkg.dependencies['@supabase/supabase-js']).toBeTruthy();
    expect(pkg.dependencies['expo-secure-store']).toBe('~15.0.8');
    expect(env).toBe('EXPO_PUBLIC_SUPABASE_URL=\nEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n');
    expect(nativeClient).toContain("from 'expo-secure-store'");
    expect(nativeClient).toContain('persistSession: true');
    expect(nativeClient).not.toContain('service_role');
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`  
Expected: FAIL because the environment contract and Supabase client do not exist.

- [ ] **Step 3: Install the approved Expo-compatible dependencies**

Run: `npx expo install @supabase/supabase-js expo-secure-store`  
Expected: both dependencies are recorded without upgrading Expo, NativeWind, React, or React Native.

- [ ] **Step 4: Add the public environment contract and SecureStore plugin**

Create `.env.example` with only:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Append `expo-secure-store` to `app.json` plugins and keep `nutritionhandbook` unchanged.

- [ ] **Step 5: Implement nullable platform clients**

Use this native contract:

```ts
const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
export const isSupabaseConfigured = Boolean(url && key);
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;
```

The web file uses the same exports, omits SecureStore, sets `detectSessionInUrl: true`, and keeps `persistSession: true`.

- [ ] **Step 6: Run focused tests and type checking**

Run: `npm test -- --runTestsByPath __tests__/auth-config-test.ts`  
Expected: PASS.

Run: `npx tsc --noEmit`  
Expected: PASS.

---

### Task 2: Implement Vietnam phone normalization and OTP Auth service

**Files:**
- Create: `lib/phone-number.ts`
- Create: `lib/auth.ts`
- Create: `types/auth.ts`
- Create: `__tests__/phone-number-test.ts`
- Create: `__tests__/phone-auth-test.ts`

**Interfaces:**
- Produces: `normalizeVietnamPhone(input): string | null`, `maskVietnamPhone(phone): string`, `sanitizeOtp(input): string`, `requestPhoneOtp(phone): Promise<AuthActionResult>`, and `verifyPhoneOtp(phone, token): Promise<AuthActionResult>`.

- [ ] **Step 1: Write failing phone helper tests**

```ts
expect(normalizeVietnamPhone('0912 345 678')).toBe('+84912345678');
expect(normalizeVietnamPhone('912-345-678')).toBe('+84912345678');
expect(normalizeVietnamPhone('+84 912 345 678')).toBe('+84912345678');
expect(normalizeVietnamPhone('123')).toBeNull();
expect(maskVietnamPhone('+84912345678')).toBe('+84 912 *** 678');
expect(sanitizeOtp('2a4 8-01')).toBe('24801');
expect(sanitizeOtp('1234567')).toBe('123456');
```

- [ ] **Step 2: Run helper tests and confirm RED**

Run: `npm test -- --runTestsByPath __tests__/phone-number-test.ts`  
Expected: FAIL because `lib/phone-number.ts` does not exist.

- [ ] **Step 3: Implement pure helpers**

```ts
export function normalizeVietnamPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('84')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^\d{9}$/.test(digits) ? `+84${digits}` : null;
}

export const sanitizeOtp = (input: string) => input.replace(/\D/g, '').slice(0, 6);
```

`maskVietnamPhone` returns `+84 XXX *** XXX` for valid normalized numbers and a safe `+84 *** *** ***` fallback.

- [ ] **Step 4: Write failing Auth service tests with a mocked nullable client**

Assert that `requestPhoneOtp` calls `signInWithOtp({ phone })`, `verifyPhoneOtp` calls `verifyOtp({ phone, token, type: 'sms' })`, configuration absence maps to `configuration`, and Supabase errors map to `error` without exposing raw token/session data.

- [ ] **Step 5: Implement the Auth result contract and service**

```ts
export type AuthActionResult =
  | { status: 'success' }
  | { status: 'configuration' }
  | { status: 'error'; message?: string };
```

Return `success` only when Supabase returns no error. Do not log inputs or Auth responses.

- [ ] **Step 6: Run both focused test suites**

Run: `npm test -- --runTestsByPath __tests__/phone-number-test.ts __tests__/phone-auth-test.ts`  
Expected: PASS.

---

### Task 3: Implement social OAuth and session observation

**Files:**
- Create: `lib/auth-oauth.ts`
- Create: `lib/auth-oauth.web.ts`
- Create: `hooks/use-auth-session.ts`
- Create: `__tests__/auth-oauth-test.ts`
- Extend: `__tests__/auth-config-test.ts`

**Interfaces:**
- Produces: `signInWithProvider(provider: 'google' | 'facebook'): Promise<OAuthResult>` and `useAuthSession(): { isLoading: boolean; session: Session | null }`.

- [ ] **Step 1: Write failing source and callback contract tests**

Assert native OAuth uses `Linking.createURL('auth/callback')`, `skipBrowserRedirect: true`, `WebBrowser.openAuthSessionAsync`, `exchangeCodeForSession` for a `code` callback, and `setSession` for access/refresh token callbacks. Assert cancellation maps to `cancelled`.

- [ ] **Step 2: Run the focused OAuth test and confirm RED**

Run: `npm test -- --runTestsByPath __tests__/auth-oauth-test.ts`  
Expected: FAIL because the OAuth modules do not exist.

- [ ] **Step 3: Implement native and web OAuth orchestration**

Native result contract:

```ts
export type OAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'configuration' }
  | { status: 'error' };
```

Use the system browser on native. The web module calls `signInWithOAuth` with a browser redirect and returns `success` only when a session becomes available through Supabase Auth state.

- [ ] **Step 4: Implement one focused session hook**

When `supabase` is null, finish loading with a null session. Otherwise call `getSession`, subscribe with `onAuthStateChange`, and unsubscribe on cleanup. Start/stop native refresh through the client module's single AppState listener.

- [ ] **Step 5: Run OAuth tests and type checking**

Run: `npm test -- --runTestsByPath __tests__/auth-oauth-test.ts __tests__/auth-config-test.ts`  
Expected: PASS.

Run: `npx tsc --noEmit`  
Expected: PASS.

---

### Task 4: Build the approved login and OTP interface

**Files:**
- Create: `constants/auth.ts`
- Create: `components/auth/social-login-button.tsx`
- Create: `components/auth/otp-input.tsx`
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/verify-otp.tsx`
- Create: `__tests__/login-content-test.ts`
- Create: `__tests__/otp-content-test.ts`

**Interfaces:**
- Login pushes `{ pathname: '/(auth)/verify-otp', params: { phone } }` after a successful OTP request.
- OTP replaces with `/(tabs)` after successful verification.

- [ ] **Step 1: Write failing source-contract tests**

The login test asserts the exact approved Vietnamese copy, `+84`, phone field before Google/Facebook, one Apricot CTA, accessibility labels, and absence of guest/email/password actions. The OTP test asserts six cells, exact neutral copy, a 60-second timer, compact support-group spacing, and absence of `Đổi số điện thoại`.

- [ ] **Step 2: Run content tests and confirm RED**

Run: `npm test -- --runTestsByPath __tests__/login-content-test.ts __tests__/otp-content-test.ts`  
Expected: FAIL because the screens and components do not exist.

- [ ] **Step 3: Implement shared copy and provider button**

Keep copy in `constants/auth.ts`; render provider icons plus text in a 54 px white outlined button with a 17 px radius, explicit button role, busy/disabled state, and a centered label.

- [ ] **Step 4: Implement the accessible OTP input**

Use one numeric `TextInput` with `maxLength={6}`, `textContentType="oneTimeCode"`, `autoComplete="sms-otp"`, and one accessibility label. Map the sanitized value into six 48–52 px visual cells; focus uses Apricot border plus caret, not color alone.

- [ ] **Step 5: Implement login layout and interactions**

Use `SafeAreaView`, `KeyboardAvoidingView`, and the existing NativeWind wrappers. Follow the approved Cloud/Ink/Slate/Apricot tokens and 20 px horizontal padding. Validate locally before calling Supabase; preserve the phone value on recoverable error.

- [ ] **Step 6: Implement OTP layout, timer, resend, and verification**

Initialize countdown at 60, decrement once per second, enable resend at zero, clear OTP after successful resend, clear errors when editing, and keep the privacy reassurance 20–24 px below the countdown. Back navigation returns to login; there is no separate change-phone action.

- [ ] **Step 7: Run UI content tests, type checking, and lint**

Run: `npm test -- --runTestsByPath __tests__/login-content-test.ts __tests__/otp-content-test.ts`  
Expected: PASS.

Run: `npx tsc --noEmit`  
Expected: PASS.

Run: `npm run lint`  
Expected: PASS with no new warnings.

---

### Task 5: Integrate onboarding, startup routing, and protected main tabs

**Files:**
- Modify: `lib/onboarding-storage.ts`
- Modify: `app/index.tsx`
- Modify: `app/onboarding.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `__tests__/onboarding-storage-test.ts`
- Modify: `__tests__/onboarding-navigation-test.ts`
- Create: `__tests__/auth-navigation-test.ts`

**Interfaces:**
- Produces: `getInitialRoute(hasSession: boolean): Promise<'/onboarding' | '/(auth)/login' | '/(tabs)'>`.

- [ ] **Step 1: Update routing tests to RED**

Assert incomplete onboarding always returns `/onboarding`; completed onboarding without a session returns `/(auth)/login`; completed onboarding with a session returns `/(tabs)`; onboarding completion replaces with `/(auth)/login`; unauthenticated tabs render a `Redirect` to login.

- [ ] **Step 2: Run routing tests and confirm failure**

Run: `npm test -- --runTestsByPath __tests__/onboarding-storage-test.ts __tests__/onboarding-navigation-test.ts __tests__/auth-navigation-test.ts`  
Expected: FAIL because startup and onboarding currently route directly to tabs.

- [ ] **Step 3: Implement session-aware startup routing**

Call `supabase?.auth.getSession()` in `app/index.tsx`, default safely to no session when configuration/network lookup fails, then call `getInitialRoute(Boolean(session))`.

- [ ] **Step 4: Route onboarding to auth and guard tabs**

Change the shared onboarding completion function to `router.replace('/(auth)/login')`. Register the `(auth)` group without a header. In the tabs layout, render nothing while loading and `<Redirect href="/(auth)/login" />` when no session exists.

- [ ] **Step 5: Run routing tests and the complete suite**

Run: `npm test -- --runTestsByPath __tests__/onboarding-storage-test.ts __tests__/onboarding-navigation-test.ts __tests__/auth-navigation-test.ts`  
Expected: PASS.

Run: `npm test`  
Expected: every suite passes.

---

### Task 6: Final verification and operational handoff

**Files:**
- No new production files.

- [ ] **Step 1: Run automated verification from a clean command invocation**

Run: `npm test`  
Expected: all tests pass.

Run: `npx tsc --noEmit`  
Expected: no TypeScript errors.

Run: `npm run lint`  
Expected: no lint errors.

- [ ] **Step 2: Verify no sensitive test values were committed**

Run: `rg -n "service_role|SUPABASE_SECRET|123456|test.*phone" app components constants hooks lib types .env.example`  
Expected: no service keys, fixed OTPs, or test phone numbers in production source; test fixture digits may appear only in Jest assertions.

- [ ] **Step 3: Document the external Supabase prerequisites in the handoff**

Report that the project still requires a local `.env`, Phone provider enabled, dashboard test phone/OTP mapping, Google/Facebook provider credentials, and `nutritionhandbook://auth/callback` in the Supabase redirect allow list. Do not claim real provider success without device testing against that configured project.

- [ ] **Step 4: Remind the user about deferred profile setup before future work**

State explicitly that the three-step profile flow remains deferred and needs a fresh decision about entry point and persistence before implementation.
