# Login Auth Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the approved Supabase login flow with native PKCE, safe cancellation, complete route guards, a temporary local logout button, and a clean TypeScript check.

**Architecture:** Keep the existing per-route access-destination architecture. Add one pure OAuth callback parser, let Supabase JS own PKCE verifier storage through the existing SecureStore adapter, short-circuit authenticated routing before AsyncStorage, and extend existing guards to onboarding and modal routes. Do not add dependencies or restructure the router.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, Supabase JS 2.110, Expo WebBrowser, Expo SecureStore, Jest.

## Global Constraints

- Preserve the approved login, onboarding, and main-screen visual design.
- Support exactly Google and Facebook.
- Do not add Google or Meta native SDKs.
- Do not add or upgrade dependencies.
- Keep web OAuth behavior unchanged.
- Logout must remain visible until the user requests removal.
- Logout clears only the current Supabase session and must preserve onboarding completion.
- Never log OAuth callback URLs, codes, verifiers, access tokens, or refresh tokens.
- Preserve the untracked `tmp/` directory and unrelated user changes.
- Use NativeWind for new static UI styling.

## Documentation References

- Supabase PKCE: https://supabase.com/docs/guides/auth/sessions/pkce-flow
- Supabase code exchange: https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession
- Supabase sign-out scopes: https://supabase.com/docs/guides/auth/signout
- Expo SDK 54 WebBrowser: https://docs.expo.dev/versions/v54.0.0/sdk/webbrowser/
- Expo SDK 54 Linking: https://docs.expo.dev/versions/v54.0.0/sdk/linking/
- Expo Router authentication redirects: https://docs.expo.dev/router/advanced/authentication-rewrites/

---

### Task 1: Replace Native Implicit OAuth with PKCE

**Files:**
- Create: `lib/oauth-callback.ts`
- Modify: `types/auth.ts`
- Modify: `lib/supabase.ts`
- Modify: `lib/auth-oauth.ts`
- Modify: `__tests__/auth-oauth-test.ts`
- Modify: `__tests__/auth-config-test.ts`

**Interfaces:**
- Produces: `parseOAuthCallback(url: string): OAuthCallbackResult`
- Produces: `OAuthCallbackResult` with `success`, `cancelled`, and `error` variants.
- Preserves: `signInWithProvider(provider): Promise<SocialAuthResult>`
- Consumes later: the existing login screen continues to react only to `success`, `cancelled`, or `redirected`.

- [ ] **Step 1: Install the locked dependency tree for this isolated worktree**

Run:

```powershell
npm ci
```

Expected: dependencies install from `package-lock.json` without modifying
`package.json` or `package-lock.json`.

- [ ] **Step 2: Write failing callback and configuration tests**

Replace the token-fragment tests in `__tests__/auth-oauth-test.ts` with:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseOAuthCallback } from '../lib/oauth-callback';

describe('social OAuth', () => {
  it('extracts a one-time authorization code from a PKCE callback', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?code=authorization-code',
      ),
    ).toEqual({ status: 'success', code: 'authorization-code' });
  });

  it('treats provider access denial as cancellation', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?error=access_denied&error_description=cancelled',
      ),
    ).toEqual({ status: 'cancelled' });
  });

  it.each([
    'nutritionhandbook://auth/callback',
    'nutritionhandbook://auth/callback?error=server_error',
    'nutritionhandbook://auth/callback#access_token=access&refresh_token=refresh',
  ])('rejects an unsafe or incomplete callback: %s', (url) => {
    expect(parseOAuthCallback(url)).toEqual({ status: 'error' });
  });

  it('supports exactly Google and Facebook without installing URL tokens', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'auth-oauth.ts'), 'utf8');
    const typesSource = readFileSync(join(root, 'types', 'auth.ts'), 'utf8');

    expect(typesSource).toContain("'google' | 'facebook'");
    expect(nativeSource).toContain('skipBrowserRedirect: true');
    expect(nativeSource).toContain('openAuthSessionAsync');
    expect(nativeSource).toContain('exchangeCodeForSession');
    expect(nativeSource).not.toContain('setSession');
    expect(nativeSource).not.toContain('access_token');
    expect(nativeSource).not.toContain('refresh_token');
    expect(nativeSource).not.toContain('console.log');
    expect(nativeSource).not.toContain('console.debug');
  });
});
```

Add this assertion to the native configuration case in
`__tests__/auth-config-test.ts`:

```ts
expect(nativeSource).toContain("flowType: 'pkce'");
```

- [ ] **Step 3: Run the targeted tests and verify red**

Run:

```powershell
npm test -- --runInBand __tests__/auth-oauth-test.ts __tests__/auth-config-test.ts
```

Expected: FAIL because `lib/oauth-callback.ts` is missing and the native client
does not yet declare PKCE.

- [ ] **Step 4: Add the callback result type and pure parser**

Replace the token type in `types/auth.ts` with:

```ts
export type OAuthCallbackResult =
  | { status: 'success'; code: string }
  | { status: 'cancelled' }
  | { status: 'error' };
```

Keep `SocialAuthProvider` and `SocialAuthResult` unchanged.

Create `lib/oauth-callback.ts`:

```ts
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
```

- [ ] **Step 5: Configure PKCE and exchange the authorization code**

Add the following native auth option in `lib/supabase.ts`:

```ts
flowType: 'pkce',
```

Update `lib/auth-oauth.ts` to consume the parser:

```ts
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
```

- [ ] **Step 6: Run targeted and regression tests**

Run:

```powershell
npm test -- --runInBand __tests__/auth-oauth-test.ts __tests__/auth-config-test.ts __tests__/login-content-test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the PKCE task**

```powershell
git add lib/oauth-callback.ts types/auth.ts lib/supabase.ts lib/auth-oauth.ts __tests__/auth-oauth-test.ts __tests__/auth-config-test.ts
git commit -m "fix: use PKCE for native social login"
```

---

### Task 2: Harden Access Routing and Direct Route Guards

**Files:**
- Modify: `lib/onboarding-storage.ts`
- Modify: `hooks/use-access-destination.ts`
- Modify: `app/onboarding.tsx`
- Modify: `app/modal.tsx`
- Modify: `__tests__/onboarding-storage-test.ts`
- Modify: `__tests__/login-navigation-test.ts`

**Interfaces:**
- Preserves: `getInitialRoute(hasSession): Promise<AccessDestination>`
- Preserves: `useAccessDestination(): { destination; isLoading }`
- Guarantees: authenticated routing never depends on onboarding storage.
- Guarantees: session loss clears the stale authenticated destination before resolving login/onboarding.

- [ ] **Step 1: Write failing routing tests**

Add to `__tests__/onboarding-storage-test.ts`:

```ts
it('does not read onboarding storage for an authenticated user', async () => {
  const readSpy = jest
    .spyOn(AsyncStorage, 'getItem')
    .mockRejectedValueOnce(new Error('storage unavailable'));

  await expect(getInitialRoute(true)).resolves.toBe('/(tabs)');
  expect(readSpy).not.toHaveBeenCalled();
});
```

Extend `__tests__/login-navigation-test.ts`:

```ts
const modal = readFileSync(join(root, 'app', 'modal.tsx'), 'utf8');

expect(onboarding).toContain('useAccessDestination');
expect(onboarding).toContain("destination !== '/onboarding'");
expect(onboarding).toContain('<Redirect href={destination} />');
expect(modal).toContain('useAccessDestination');
expect(modal).toContain("destination !== '/(tabs)'");
expect(modal).toContain('<Redirect href={destination} />');
expect(accessHook).toContain("setDestination('/(tabs)')");
expect(accessHook).toContain('setDestination(null)');
expect(accessHook).toContain('getInitialRoute(false)');
```

Replace the old assertion:

```ts
expect(accessHook).toContain('getInitialRoute(Boolean(session))');
```

with the three access-hook assertions above.

- [ ] **Step 2: Run targeted tests and verify red**

Run:

```powershell
npm test -- --runInBand __tests__/onboarding-storage-test.ts __tests__/login-navigation-test.ts
```

Expected: FAIL because authenticated routing still reads AsyncStorage and modal
and onboarding do not contain access guards.

- [ ] **Step 3: Short-circuit authenticated storage routing**

Update `getInitialRoute` in `lib/onboarding-storage.ts`:

```ts
export async function getInitialRoute(
  hasSession: boolean,
): Promise<'/onboarding' | '/login' | '/(tabs)'> {
  if (hasSession) {
    return '/(tabs)';
  }

  return resolveAccessDestination({
    hasCompletedOnboarding: await readOnboardingCompleted(),
    hasSession: false,
  });
}
```

- [ ] **Step 4: Clear stale access state on session loss**

Replace the effect body in `hooks/use-access-destination.ts` with:

```ts
useEffect(() => {
  if (isAuthLoading) {
    return;
  }

  if (session) {
    setDestination('/(tabs)');
    return;
  }

  setDestination(null);
  let isMounted = true;

  void getInitialRoute(false)
    .then((route) => {
      if (isMounted) {
        setDestination(route);
      }
    })
    .catch(() => {
      if (isMounted) {
        setDestination('/onboarding');
      }
    });

  return () => {
    isMounted = false;
  };
}, [isAuthLoading, session]);
```

- [ ] **Step 5: Guard onboarding and modal**

In `app/onboarding.tsx`, change the router import to:

```ts
import { Redirect, useRouter } from 'expo-router';
```

Add:

```ts
import { useAccessDestination } from '@/hooks/use-access-destination';
```

Inside `OnboardingScreen`, call the hook with the other hooks:

```ts
const { destination, isLoading: isAccessLoading } = useAccessDestination();
```

After all hooks and local callback declarations, before the JSX return:

```ts
if (isAccessLoading || !destination) {
  return null;
}

if (destination !== '/onboarding') {
  return <Redirect href={destination} />;
}
```

Replace `app/modal.tsx` imports and component prefix with:

```ts
import { Link, Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAccessDestination } from '@/hooks/use-access-destination';

export default function ModalScreen() {
  const { destination, isLoading } = useAccessDestination();

  if (isLoading || !destination) {
    return null;
  }

  if (destination !== '/(tabs)') {
    return <Redirect href={destination} />;
  }

  return (
```

Keep the existing modal body and styles unchanged.

- [ ] **Step 6: Run targeted and regression tests**

Run:

```powershell
npm test -- --runInBand __tests__/access-routing-test.ts __tests__/onboarding-storage-test.ts __tests__/login-navigation-test.ts __tests__/onboarding-navigation-test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit routing hardening**

```powershell
git add lib/onboarding-storage.ts hooks/use-access-destination.ts app/onboarding.tsx app/modal.tsx __tests__/onboarding-storage-test.ts __tests__/login-navigation-test.ts
git commit -m "fix: harden auth route transitions"
```

---

### Task 3: Add the Temporary Local Logout Button

**Files:**
- Modify: `constants/auth.ts`
- Modify: `app/(tabs)/index.tsx`
- Create: `__tests__/logout-test.ts`

**Interfaces:**
- Produces: an always-visible `Đăng xuất` button on the main tab.
- Calls: `supabase.auth.signOut({ scope: 'local' })`.
- Relies on: Task 2's tabs guard to redirect after the auth-state event.
- Preserves: `aurale.onboardingCompleted` in AsyncStorage.

- [ ] **Step 1: Write the failing logout test**

Create `__tests__/logout-test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('temporary logout control', () => {
  it('signs out only the current session without clearing onboarding', () => {
    const root = process.cwd();
    const main = readFileSync(
      join(root, 'app', '(tabs)', 'index.tsx'),
      'utf8',
    );
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');

    expect(main).toContain("signOut({ scope: 'local' })");
    expect(main).toContain('logoutCopy.label');
    expect(main).toContain('accessibilityRole="button"');
    expect(main).toContain('accessibilityRole="alert"');
    expect(main).not.toContain('AsyncStorage');
    expect(main).not.toContain('markOnboardingCompleted');
    expect(copy).toContain("label: 'Đăng xuất'");
    expect(copy).toContain("loading: 'Đang đăng xuất…'");
  });
});
```

- [ ] **Step 2: Run the test and verify red**

Run:

```powershell
npm test -- --runInBand __tests__/logout-test.ts
```

Expected: FAIL because the logout control and copy do not exist.

- [ ] **Step 3: Add focused logout copy**

Append to `constants/auth.ts`:

```ts
export const logoutCopy = {
  label: 'Đăng xuất',
  loading: 'Đang đăng xuất…',
  error: 'Chưa thể đăng xuất. Vui lòng thử lại.',
} as const;
```

- [ ] **Step 4: Add local logout behavior and UI**

Update imports in `app/(tabs)/index.tsx`:

```ts
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { logoutCopy } from '@/constants/auth';
import { supabase } from '@/lib/supabase';
```

At the top of `HomeScreen`, add:

```ts
const [isSigningOut, setIsSigningOut] = useState(false);
const [signOutError, setSignOutError] = useState<string | null>(null);

const logout = async () => {
  if (isSigningOut) {
    return;
  }

  setIsSigningOut(true);
  setSignOutError(null);

  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      throw error;
    }
  } catch {
    setSignOutError(logoutCopy.error);
  } finally {
    setIsSigningOut(false);
  }
};
```

Insert below the existing title container:

```tsx
<View className="gap-2">
  <Pressable
    accessibilityLabel={logoutCopy.label}
    accessibilityRole="button"
    accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
    className="min-h-12 items-center justify-center rounded-2xl border border-ink-navy px-4"
    disabled={isSigningOut}
    onPress={() => void logout()}
    style={({ pressed }) => ({ opacity: pressed || isSigningOut ? 0.65 : 1 })}>
    <Text className="font-sans text-[15px] font-bold text-ink-navy">
      {isSigningOut ? logoutCopy.loading : logoutCopy.label}
    </Text>
  </Pressable>
  {signOutError ? (
    <Text
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="text-center text-[14px] text-coral-notice">
      {signOutError}
    </Text>
  ) : null}
</View>
```

- [ ] **Step 5: Run logout and routing regression tests**

Run:

```powershell
npm test -- --runInBand __tests__/logout-test.ts __tests__/login-navigation-test.ts __tests__/onboarding-storage-test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the logout control**

```powershell
git add constants/auth.ts "app/(tabs)/index.tsx" __tests__/logout-test.ts
git commit -m "feat: add temporary local logout"
```

---

### Task 4: Make the TypeScript Check Clean

**Files:**
- Modify: `app/(tabs)/explore.tsx`
- Modify: `components/external-link.tsx`
- Modify: `components/haptic-tab.tsx`
- Modify: `components/hello-wave.tsx`
- Modify: `components/parallax-scroll-view.tsx`
- Modify: `components/themed-text.tsx`
- Modify: `components/themed-view.tsx`
- Modify: `components/ui/collapsible.tsx`
- Modify: `components/ui/icon-symbol.ios.tsx`
- Modify: `components/ui/icon-symbol.tsx`

**Interfaces:**
- Produces no runtime behavior changes.
- Resolves every TS2686 error produced by the project's `"jsx": "react"` setting.
- Builds on Task 2 adding React to `app/modal.tsx` and Task 3 adding React to the main tab.

- [ ] **Step 1: Run TypeScript and capture the expected red state**

Run:

```powershell
npx tsc --noEmit --pretty false
```

Expected: FAIL only with TS2686 React-in-scope errors in the listed files.

- [ ] **Step 2: Add explicit React imports**

Use these import forms:

```ts
// app/(tabs)/explore.tsx
import React from 'react';

// components/external-link.tsx
import React, { type ComponentProps } from 'react';

// components/haptic-tab.tsx
import React from 'react';

// components/hello-wave.tsx
import React from 'react';

// components/parallax-scroll-view.tsx
import React, { type PropsWithChildren, type ReactElement } from 'react';

// components/themed-text.tsx
import React from 'react';

// components/themed-view.tsx
import React from 'react';

// components/ui/collapsible.tsx
import React, { type PropsWithChildren, useState } from 'react';

// components/ui/icon-symbol.ios.tsx
import React from 'react';

// components/ui/icon-symbol.tsx
import React, { type ComponentProps } from 'react';
```

Remove the superseded named-only imports from `react` in those files. Do not
change component bodies or styles.

- [ ] **Step 3: Verify TypeScript and lint**

Run:

```powershell
npx tsc --noEmit --pretty false
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit the TypeScript cleanup**

```powershell
git add "app/(tabs)/explore.tsx" components/external-link.tsx components/haptic-tab.tsx components/hello-wave.tsx components/parallax-scroll-view.tsx components/themed-text.tsx components/themed-view.tsx components/ui/collapsible.tsx components/ui/icon-symbol.ios.tsx components/ui/icon-symbol.tsx
git commit -m "fix: make TypeScript check clean"
```

---

### Task 5: Verify, Review, and Update the Existing Pull Request

**Files:**
- Verify all files changed in Tasks 1–4.
- Do not modify `tmp/`.

**Interfaces:**
- Produces a reviewed commit series ready to update PR #2.
- Does not merge to `main`.

- [ ] **Step 1: Run the complete automated verification**

Run:

```powershell
npm test -- --runInBand
npm run lint
npx tsc --noEmit --pretty false
npx expo export --platform web
git diff --check codex/login-screen...HEAD
git status --short
```

Expected:

- all Jest suites pass;
- ESLint exits 0;
- TypeScript exits 0;
- Expo produces a web export;
- no whitespace errors;
- only the pre-existing untracked `tmp/` directory remains outside commits.

- [ ] **Step 2: Perform two-stage review**

Dispatch a task-spec reviewer against this plan and the implementation commits.
Fix any Critical or Important finding with a failing test first. Then dispatch a
code-quality reviewer and address any remaining correctness, security,
accessibility, or scope issue.

- [ ] **Step 3: Re-run verification after review fixes**

Run the full command set from Step 1 again. Expected: all checks pass with fresh
output.

- [ ] **Step 4: Confirm remote branch safety**

Run:

```powershell
git fetch origin
git log --oneline --left-right origin/codex/login-screen...codex/login-screen
git log --oneline codex/login-screen..HEAD
```

Expected: the remote login branch has no unexpected commits missing locally,
and `codex/login-hardening` contains only the approved spec and hardening
commits on top.

- [ ] **Step 5: Update PR #2 without merging**

Push the verified head to the existing PR branch:

```powershell
git push origin HEAD:codex/login-screen
```

Update PR #2's description with the completed checks and keep it draft until
the user manually tests both Google and Facebook on Expo Go.

- [ ] **Step 6: Manual device acceptance**

Ask the user to:

1. Open the main tab in Expo Go.
2. Tap **Đăng xuất**.
3. Confirm the app opens login without replaying onboarding.
4. Test Google and confirm it returns to main.
5. Tap **Đăng xuất** again.
6. Test Facebook and confirm it returns to main.
7. Report any provider error so Supabase and provider logs can be inspected.

Only after both providers pass should PR #2 be marked ready for review or
merged into `main`.
