# AURALE Phone Login and OTP Design

**Date:** 2026-07-28  
**Status:** Approved  
**Scope:** Mandatory login screen, Vietnam phone-number test OTP, social login actions, session gating, and navigation into the main application

## Purpose

Add a calm, trustworthy authentication step between onboarding and the signed-in application. The first implementation supports a Vietnam phone-number field and Supabase test OTP without sending a real SMS. Google and Facebook remain visible as alternative Supabase Auth methods.

This implementation does not collect or persist profile or health information. The previously designed three-step profile setup flow is deferred and is not part of the current route sequence.

## Approved route sequence

```text
Onboarding → Login → OTP verification → Main tabs
```

- Completing or skipping onboarding opens login.
- A valid persisted Supabase session bypasses login and opens the main tabs after onboarding is complete.
- Submitting a valid phone number opens OTP verification.
- A valid OTP replaces the authentication stack with the main tabs.
- Google or Facebook success also opens the main tabs.
- Failed, cancelled, or expired authentication keeps the user in the authentication flow.
- Direct unauthenticated access to the main tabs redirects to login.
- The profile setup route does not run before or after login in this implementation.

## Authentication architecture

Use Supabase Auth with:

- `signInWithOtp({ phone })` for phone authentication.
- `verifyOtp({ phone, token, type: 'sms' })` for OTP verification.
- Google and Facebook OAuth through the system authentication browser.
- A SecureStore-compatible adapter for native Supabase session persistence.
- Supabase browser storage behavior on web.

Only the Supabase project URL and publishable key may be exposed through `EXPO_PUBLIC_*` variables. Provider secrets, service-role keys, test OTP codes, and private credentials must never be placed in the mobile client.

The test phone number and fixed OTP are configured in the Supabase dashboard. The app uses the same production-shaped API calls as real phone OTP, but Supabase recognizes the configured test number and does not contact an SMS provider.

## Login screen

### Visual system

- Cloud Canvas `#FFF9F0` background.
- Clean Surface `#FFFFFF` fields and provider buttons.
- Ink Navy `#2F3542` primary text.
- Soft Slate `#697386` supporting text.
- Apricot Action `#FF9E7A` for the primary CTA.
- Quiet warm-gray borders.
- Small, restrained Peach/Butter decoration only.
- Left-aligned single-column layout with 20–24 px horizontal padding.
- Compact AURALE wordmark near the top safe area.
- Inputs and buttons are 52–54 px high with 16–17 px corner radii.
- No gradients, dark navy CTA, giant decorative circles, clinical styling, or mockup-only device labels.

### Exact content order

1. Wordmark: `AURALE`
2. Heading: `Chào mừng bạn quay trở lại.`
3. Supporting copy: `Đăng nhập để lưu lại bữa ăn, thói quen và những ghi chú sức khỏe quan trọng.`
4. Visible field label: `Số điện thoại`
5. Phone field with fixed `+84` prefix and placeholder `Nhập số điện thoại`
6. Apricot primary action: `Tiếp tục`
7. Divider: `hoặc`
8. `Tiếp tục với Google`
9. `Tiếp tục với Facebook`
10. Legal copy: `Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư.`

The phone field accepts Vietnamese mobile numbers only. Normalize spaces and punctuation, remove one leading `0`, and submit the remaining nine digits as `+84xxxxxxxxx`. Invalid values show calm inline guidance and do not call Supabase.

## OTP verification screen

### Exact content

- Back action and compact `AURALE` wordmark.
- Heading: `Xác minh số điện thoại`
- Supporting copy: `Nhập mã xác thực gồm 6 số cho {maskedPhone}.`
- Six visible OTP cells.
- Apricot primary action: `Xác minh`
- Countdown copy: `Gửi lại mã sau 00:60`, decreasing once per second.
- Privacy reassurance: `Mã xác thực chỉ dùng một lần.`

Do not render an action to change the phone number. The back action returns to login and preserves no OTP digits.

The OTP input starts empty. It accepts digits only, limits the value to six digits, supports paste/autofill through one underlying input, and visually maps the value into six cells. Verification is enabled only when six digits are present.

The resend line and privacy reassurance form one compact support group with approximately 20–24 px between them. When the countdown reaches zero, the resend action becomes available. A successful resend resets the countdown to 60 seconds and clears the OTP value.

The explanatory copy must stay neutral because test OTP does not send an SMS. Do not claim that a message or code was sent.

## Interaction and error states

### Phone submission

- Disable phone and provider actions while one request is running.
- Show a restrained loading state without changing the approved button hierarchy.
- On a network/configuration error, show calm inline copy and keep the entered number.
- On success, navigate to OTP while passing the normalized phone number as a route parameter.

### OTP verification

- Invalid or expired OTP: `Mã xác thực chưa đúng hoặc đã hết hạn. Vui lòng thử lại.`
- Offline: `Cần kết nối internet để xác minh.`
- Missing Supabase configuration: `Đăng nhập chưa được cấu hình. Vui lòng thử lại sau.`
- Clear the inline OTP error when the user edits the code.
- Prevent duplicate verification and resend requests.
- On success, replace the auth flow with `/(tabs)` so back navigation cannot reopen OTP.

### Social login

- Keep Google and Facebook available in the approved order.
- Disable both provider buttons while either provider is connecting.
- Cancellation returns quietly to idle.
- A recoverable error shows `Chưa thể đăng nhập. Vui lòng thử lại.`
- Successful OAuth replaces the auth flow with `/(tabs)`.

## Component boundaries

- `app/(auth)/login.tsx`: login route composition and temporary interaction state.
- `app/(auth)/verify-otp.tsx`: OTP route composition, countdown, and temporary interaction state.
- `components/auth/social-login-button.tsx`: accessible provider button.
- `components/auth/otp-input.tsx`: single hidden/transparent numeric input and six visual cells.
- `constants/auth.ts`: exact copy and shared constants.
- `lib/phone-number.ts`: Vietnam normalization, validation, masking, and OTP digit sanitation.
- `lib/supabase.ts` and `lib/supabase.web.ts`: platform Supabase clients.
- `lib/auth.ts`: phone OTP and verification service.
- `lib/auth-oauth.ts` and `lib/auth-oauth.web.ts`: social OAuth orchestration.
- `hooks/use-auth-session.ts`: focused Supabase session observer for route gates.

Do not add Zustand, database tables, profile records, or health-data persistence.

## Accessibility and responsive behavior

- Respect top and bottom safe areas.
- Preserve minimum 44 px touch targets.
- Keep visible labels separate from placeholders.
- Give inputs and actions explicit accessibility labels and roles.
- Expose OTP entry as one understandable text input rather than six unrelated screen-reader fields.
- Announce inline errors and busy states.
- Do not use color alone for focus, error, loading, or disabled states.
- Use a scrollable keyboard-aware layout so small phones and larger text do not clip controls.
- Keep a phone-width content column on tablets and web.
- Respect reduced-motion preferences.

## Verification criteria

- Onboarding completion routes to login.
- Login matches the approved phone-first mockup and exact Vietnamese copy.
- A valid Vietnam mobile number opens OTP verification.
- OTP contains no `Đổi số điện thoại` action.
- The resend and privacy rows use compact approved spacing.
- Supabase test phone login and OTP verification use the production-shaped APIs.
- Successful phone or social authentication opens `/(tabs)`.
- Persisted sessions bypass login; missing sessions cannot access tabs directly.
- Test phone numbers and OTP codes are absent from source and committed environment examples.
- Account linking is not implemented.
- Relevant Jest tests, TypeScript checking, and `npm run lint` pass.

## Out of scope

- Real SMS-provider configuration or SMS delivery.
- Account linking or merging between phone and social identities.
- Sign-up-specific UI, email/password login, guest mode, Apple login, recovery, sign-out, or account deletion.
- Profile setup, profile persistence, database tables, RLS policies, analytics, or health-data persistence.
- Production OAuth credentials and production legal URLs.
