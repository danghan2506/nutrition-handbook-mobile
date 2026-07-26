# AURALE Login Screen Design

**Date:** 2026-07-22  
**Status:** Approved visual design  
**Scope:** Login screen experience and navigation intent only

## Purpose

Add a calm, trustworthy login step between onboarding and the signed-in application. Login is required so future meal, habit, and health-note data can be associated with the user's account.

The approved authentication architecture uses Supabase Auth, AURALE-owned React Native provider buttons, OAuth through the system browser, and Expo SecureStore for persistent session tokens. This specification does not approve OAuth credentials, database tables, or health-data storage.

## Approved flow

The route sequence is:

```text
Onboarding → Login → Signed-in application
```

- Completing or skipping onboarding opens the login screen.
- The login screen cannot be skipped and has no guest mode.
- A successful authentication result opens the signed-in application.
- A failed or cancelled authentication attempt keeps the user on the login screen.
- Returning users with completed onboarding and a valid persisted session bypass login and open the signed-in application. Users whose onboarding state is incomplete still see onboarding first.

## Approved visual direction

Use the selected **Calm social** direction:

- Warm Cloud Canvas background (`#FFF9F0`).
- Ink Navy (`#2F3542`) for primary copy and structural elements.
- Soft Slate (`#697386`) for supporting copy.
- Restrained soft circles in Butter, Leaf, and Sky tones as background decoration.
- Generous whitespace and a single-column mobile layout.
- No clinical styling, gradients, dense panels, or decorative noise.

The header uses the text wordmark **AURALE** only. Do not show the circular logo mark that appeared in early mockups.

The word **Connected** belongs to the browser-based mockup companion. It is not part of the product design and must never be rendered by the app.

## Screen content

### Brand

```text
AURALE
```

Use a compact, bold wordmark with restrained tracking near the top safe area.

### Heading

```text
Chào mừng bạn quay trở lại.
```

The heading is short and natural. It does not repeat the brand name or add a slogan.

### Supporting copy

```text
Đăng nhập để lưu lại bữa ăn, thói quen và những ghi chú sức khỏe quan trọng.
```

This explains the purpose of login without implying diagnosis, treatment, or guaranteed security outcomes.

### Authentication methods

Show exactly two actions in this order:

1. **Tiếp tục với Google**
2. **Tiếp tục với Facebook**

Do not include email login, password login, Apple login, or a guest/skip action in this version.

Each action is a full-width, minimum 54 px button with:

- Provider icon on the left.
- Centered provider label.
- Quiet chevron on the right.
- White surface, subtle border, and 17 px corner radius.
- A minimum 44 px accessible touch target.
- Screen-reader label and button role.
- Loading and disabled feedback that does not rely on color alone.

Use provider branding according to the current Google and Facebook brand requirements. The surrounding button layout remains consistent with AURALE.

### Legal copy

Show quiet legal text below the provider buttons:

```text
Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư.
```

`Điều khoản` and `Chính sách quyền riêng tư` are separate accessible links. Their destinations must be approved and available before a production release.

## Component boundaries

The implementation should keep the route screen small and readable:

- `app/login.tsx`: route composition, safe-area layout, and navigation result handling.
- `components/auth/social-login-button.tsx`: reusable provider button presentation and accessibility behavior.
- Authentication client/service: separate module selected only after the backend and provider approach is approved.

Do not add Zustand or another global auth store for this feature. Supabase session persistence, its auth-state subscription, and focused route-level gates are sufficient.

## Authentication approach decision

Use Supabase Auth for Google and Facebook social authentication. Keep the approved AURALE-owned React Native buttons instead of Supabase web UI or provider-native button SDKs.

The approved implementation adds:

- `@supabase/supabase-js` for authentication and session management.
- `expo-secure-store` for encrypted local storage of Supabase session tokens.
- The already-installed `expo-web-browser` and `expo-linking` packages for OAuth browser sessions and redirects.

OAuth opens in the system authentication browser and returns through an application deep link. Supabase persists the session through a SecureStore-compatible storage adapter. AsyncStorage remains limited to non-sensitive onboarding state.

OAuth client IDs, secrets, dashboard provider settings, redirect URLs, and production legal-link destinations must be supplied or approved before production authentication can succeed. Never expose provider secrets or a Supabase secret/service-role key in the mobile client.

## Interaction states

### Idle

Both provider buttons are enabled.

### Loading

- Disable both buttons after a provider action starts to prevent duplicate requests.
- Keep the selected provider identifiable with text such as `Đang kết nối…` and a restrained progress indicator.
- Respect reduced-motion preferences.

### Cancelled

Return to the idle state without showing an alarming error.

### Recoverable error

Show calm inline copy near the actions:

```text
Chưa thể đăng nhập. Vui lòng thử lại.
```

Keep both actions available for another attempt.

### Offline

Explain that an internet connection is required and keep the user's position on the screen.

### Success

Replace the login route with the signed-in application route so the back action does not return to login.

## Accessibility

- Preserve safe-area spacing at the top and bottom.
- Maintain readable contrast for all text and controls.
- Use 15 px or larger control labels and readable body text.
- Give each provider button an explicit accessibility label and role.
- Announce loading and inline errors to screen readers.
- Do not use provider color as the only identifier; retain icon and text labels.
- Ensure legal links have independent touch targets and accessible names.

## Responsive behavior

- Primary target: portrait phone layouts.
- Keep the content vertically balanced without obscuring actions on shorter screens.
- Allow the screen to scroll when text scaling or a small viewport would otherwise clip content.
- On tablet and web, retain a centered phone-width content column instead of stretching buttons across the viewport.

## Verification criteria

The future implementation is acceptable when:

- Onboarding completion navigates to login instead of directly to tabs.
- No skip or guest action is visible.
- Only Google and Facebook methods appear.
- The screen uses the exact approved Vietnamese copy.
- The header shows the AURALE wordmark without the circular mark.
- No mockup-only `Connected` label appears.
- Loading, cancellation, error, offline, and success states behave as specified.
- Accessibility labels, touch targets, text scaling, and reduced-motion behavior are verified.
- Relevant tests and `npm run lint` pass.

## Out of scope

- Creating or owning Google/Facebook OAuth applications and credentials.
- Adding provider-native Google or Facebook button SDKs.
- Adding database tables, profiles, RLS policies, analytics, or health-data persistence.
- Designing account creation, account linking, sign-out, deletion, or recovery flows.
- Implementing the screen in the application during the mockup phase.
