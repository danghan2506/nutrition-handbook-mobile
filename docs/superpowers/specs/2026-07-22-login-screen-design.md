# AURALE Login Screen Design

**Date:** 2026-07-22  
**Status:** Approved visual design  
**Scope:** Login screen experience and navigation intent only

## Purpose

Add a calm, trustworthy login step between onboarding and the signed-in application. Login is required so future meal, habit, and health-note data can be associated with the user's account.

This specification does not approve or implement an authentication backend, OAuth credentials, native provider SDKs, persistent session behavior, or health-data storage. Those decisions require separate user approval before implementation.

## Approved flow

The route sequence is:

```text
Onboarding → Login → Signed-in application
```

- Completing or skipping onboarding opens the login screen.
- The login screen cannot be skipped and has no guest mode.
- A successful authentication result opens the signed-in application.
- A failed or cancelled authentication attempt keeps the user on the login screen.
- Returning users with a valid session may bypass onboarding and login only after session behavior and persistence are separately approved.

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

Do not add a global auth store, session persistence, or route guard architecture until those choices are explicitly approved.

## Authentication approach decision

Supabase Auth is a viable backend for Google and Facebook social login, but it is not approved by this visual-design decision.

Supabase's ready-made UI offering is primarily aimed at web React. For Expo/React Native, the recommended visual approach is to keep AURALE-owned React Native buttons and connect them to an approved authentication service behind the scenes.

Two implementation paths remain available:

1. **Custom AURALE buttons with an OAuth backend** — recommended for visual fidelity and consistent cross-platform layout.
2. **Official native provider buttons/SDKs** — stronger provider-native presentation but introduces native dependencies, development-build requirements, and less visual control.

Before implementation, the user must explicitly approve:

- Authentication backend, including whether to use Supabase.
- OAuth flow versus native provider SDKs.
- Required packages and native configuration.
- Session persistence and sign-out behavior.
- Redirect/deep-link configuration.

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

- Selecting or configuring Supabase or another backend.
- Creating OAuth applications or credentials.
- Installing authentication packages or provider SDKs.
- Adding database tables, profiles, RLS policies, analytics, or health-data persistence.
- Designing account creation, account linking, sign-out, deletion, or recovery flows.
- Implementing the screen in the application during the mockup phase.
