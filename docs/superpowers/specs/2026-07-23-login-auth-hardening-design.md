# Login Auth Hardening Design

## Context

The current login pull request works functionally on web and retains a Supabase
session on native through Expo SecureStore. On native, however, the OAuth
callback currently returns the access and refresh tokens directly through the
deep-link URL. A retained session also makes Expo Go enter the main tabs
immediately, which prevents the Google and Facebook login buttons from being
tested again without clearing the session.

This hardening pass keeps the approved login UI and navigation order:

1. A new user completes onboarding.
2. An unauthenticated user sees login.
3. An authenticated user enters the main tabs.

## Goals

- Use Supabase PKCE for Google and Facebook OAuth on native.
- Treat a user-cancelled provider flow as cancellation, not a generic error.
- Prevent authenticated content from remaining visible after session loss.
- Guard onboarding and modal routes against invalid direct navigation.
- Add a temporary, always-visible logout button to the main screen for testing.
- Make `npx tsc --noEmit` pass without changing starter-screen behavior.
- Preserve the existing web OAuth behavior and approved login design.

## Non-goals

- Do not add Google or Meta native SDKs.
- Do not add dependencies or change Supabase provider configuration.
- Do not redesign the login, onboarding, or main screens.
- Do not clear the onboarding-completed flag during logout.
- Do not remove the temporary logout button in this change.

## Selected Approach

Apply focused hardening to the existing architecture rather than introducing a
global auth provider or restructuring the Expo Router tree. This minimizes
regression risk before merging the login pull request.

The work will be developed on `codex/login-hardening`, based on
`codex/login-screen`. After verification, the resulting commits can update the
existing login pull request branch.

## Native PKCE Flow

The native Supabase client will use `flowType: 'pkce'` while continuing to use
the existing chunked Expo SecureStore adapter. Supabase JS will create and
persist the PKCE code verifier through that adapter.

The native login flow will:

1. Create the existing `auth/callback` deep link.
2. Start `signInWithOAuth` with `skipBrowserRedirect: true`.
3. Open the returned authorization URL with Expo WebBrowser.
4. Interpret a dismissed browser as `{ status: 'cancelled' }`.
5. Parse the callback query parameters.
6. Interpret `access_denied` as `{ status: 'cancelled' }`.
7. Reject other provider callback errors without exposing callback contents.
8. Exchange the one-time `code` with
   `supabase.auth.exchangeCodeForSession(code)`.
9. Return `{ status: 'success' }` after the session exchange succeeds.

The callback will no longer parse or accept access and refresh tokens from the
URL. Web OAuth remains in `lib/auth-oauth.web.ts` and retains its current
redirect behavior.

## Access Routing and Session Loss

Authenticated state always wins over onboarding storage. When a session exists,
the access destination will resolve immediately to `/(tabs)` without reading
AsyncStorage.

When a session disappears, `useAccessDestination` will clear any previous
destination before resolving the unauthenticated destination. This prevents a
stale `/(tabs)` result from temporarily authorizing tab content.

The existing access-destination guard will also be applied to:

- `app/onboarding.tsx`: only available when the resolved destination is
  `/onboarding`.
- `app/modal.tsx`: only available when the resolved destination is `/(tabs)`.

The existing login and tabs guards remain in place. Storage-read failure for an
unauthenticated user continues to fail safely to onboarding.

## Temporary Logout

`app/(tabs)/index.tsx` will include an always-visible **Đăng xuất** button. It
will call:

```ts
supabase.auth.signOut({ scope: 'local' })
```

This clears only the current device's Supabase session. It does not clear
AsyncStorage or the onboarding-completed flag. The auth-state subscription and
route guard then move the user to login. The button will disable while logout
is in progress and show a concise error if Supabase cannot complete logout.

The button is intentionally temporary and will remain until the user requests
its removal after native provider testing.

## TypeScript Cleanup

Files that render JSX but currently rely on an unavailable global React binding
will receive explicit React imports. These changes are mechanical and must not
alter their UI or runtime behavior.

## Error Handling

- Browser dismissal and provider `access_denied` return `cancelled` silently.
- Missing authorization code and non-cancellation callback errors use the
  existing generic login error UI.
- Network-related failures continue to use the existing offline message.
- Logout failures keep the user on the main screen and display an error.
- No tokens, authorization codes, callback URLs, or verifier values are logged.

## Testing

Automated coverage will verify:

- PKCE is configured on the native Supabase client.
- A valid callback authorization code is parsed and exchanged.
- A callback containing tokens is not accepted as a PKCE success.
- Browser dismissal and `access_denied` are treated as cancellation.
- Other callback errors and missing codes fail safely.
- An authenticated user bypasses onboarding storage.
- Session loss clears stale authenticated routing before redirecting.
- Onboarding and modal routes contain access guards.
- Logout uses local scope and preserves onboarding storage.
- Full Jest, ESLint, TypeScript, and Expo web export checks pass.

After automated verification, the user will clear the retained session with the
new logout button and manually test both Google and Facebook on Expo Go. The
expected result for each provider is login returning directly to the main tabs.

## Acceptance Criteria

- Native callbacks contain and exchange a one-time authorization code instead
  of directly installing URL-delivered access and refresh tokens.
- Cancelling Google or Facebook returns to login without a generic error.
- Logging out returns to login without replaying onboarding.
- Direct navigation cannot expose tabs or modal content without a session.
- Authenticated users cannot reopen onboarding.
- Session loss does not leave authenticated content rendered.
- `npm test -- --runInBand`, `npm run lint`, `npx tsc --noEmit`, and
  `npx expo export --platform web` pass.
- The existing login pull request is updated only after review and verification.
