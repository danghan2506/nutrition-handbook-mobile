# Native Onboarding Pager Design

## Status

Approved on 2026-07-16.

## Goal

Turn the onboarding flow into a calm, native-feeling three-slide experience. Users can swipe horizontally or use the primary button, and the pagination follows the swipe continuously. Completing or skipping onboarding sends the user to the main app and prevents onboarding from appearing on later launches.

## Scope

This work covers the onboarding experience only:

- combine the existing onboarding routes into one pager route;
- preserve the current meal-tracking and gentle-habits content;
- add a third slide introducing Vietnamese food nutrition lookup;
- add animated pagination and forward/backward swipe gestures;
- persist onboarding completion locally;
- route completed users to the existing main tab area.

The real camera capture, food recognition, AI provider, nutrition calculations, and nutrition-result editing flow are explicitly out of scope. The third slide introduces those future capabilities without implementing them.

## Approved Architecture

`app/onboarding.tsx` remains the only onboarding route and owns pager coordination, the current slide index, button behavior, skip behavior, and onboarding completion. Each visual step is a focused slide component rather than a route.

```text
app/
  onboarding.tsx

components/onboarding/
  meal-tracking-slide.tsx
  gentle-habits-slide.tsx
  vietnamese-food-ai-slide.tsx
  onboarding-pagination.tsx
  vietnamese-food-ai-illustration.tsx

lib/
  onboarding-storage.ts
```

Component naming follows the approved distinction:

- `Screen` identifies the routable `OnboardingScreen`.
- `Slide` identifies one horizontally swipeable onboarding step.

The old `app/onboarding-habits.tsx` route will be removed after its content is moved into `GentleHabitsSlide`.

## Interaction Model

The pager contains exactly three slides and supports both directions.

- Swiping left advances to the next slide.
- Swiping right returns to the previous slide.
- Pressing `Tiếp tục` scrolls to the next slide with the same pager animation.
- The final slide uses `Bắt đầu` instead of `Tiếp tục`.
- `Bỏ qua` on any slide and `Bắt đầu` on the final slide share the same completion action.
- Completion stores `onboardingCompleted = true` and replaces onboarding with the existing main tab route.
- Once completed, future launches open the main app directly.

Imperative router navigation is not used between slides. `router.replace` is used only when leaving onboarding so the user cannot navigate back into it from the main app.

## Motion

The content moves horizontally with the user's finger. A shared scroll progress drives the pagination so its active indicator moves continuously rather than jumping after a page settles.

- Illustration movement may use a restrained parallax offset.
- Text may crossfade lightly between adjacent slides.
- The active pagination pill moves using transforms and opacity, not animated width or positional layout properties.
- The button remains in the fixed footer while its label crossfades from `Tiếp tục` to `Bắt đầu` on the final slide.
- Motion uses the AURALE spring direction: stiffness 100 and damping 20 where a spring is appropriate.
- Short state transitions remain within 160-240 ms.
- Reduced-motion users receive a simpler paging and fade treatment without parallax.

The implementation should use the already-installed Reanimated package and React Native pager primitives. No pager or carousel dependency is required.

## Shared Layout

All three slides preserve the established onboarding hierarchy:

1. Safe-area header with `AURALE` and `Bỏ qua`.
2. A large rounded illustration field.
3. Eyebrow, title, and concise body copy.
4. Fixed pagination and primary action near the bottom safe area.

The visual system follows `DESIGN.md`: Cloud Canvas, Ink Navy, Soft Slate, Peach Tint, Apricot Action, generous whitespace, readable type, and one primary CTA. The UI must not use purple-blue AI gradients, neon fitness styling, clinical imagery, dense metric walls, emojis, or nested card stacks.

## Slide 3: Vietnamese Food Nutrition Lookup

### Approved copy

- Eyebrow: `HIỂU MÓN ĂN QUEN THUỘC`
- Title: `Khám phá dinh dưỡng trong món Việt`
- Body: `Chụp món ăn để AI hỗ trợ nhận diện và tra cứu dinh dưỡng. Bạn luôn có thể xem lại và chỉnh sửa trước khi lưu.`
- Hero label: `AI tra cứu`
- Primary action: `Bắt đầu`

### Approved visual direction

The hero uses the user-provided `assets/images/vietnamese-pho.png` as the visual reference for a realistic Vietnamese phở bò presentation. It should feel like food captured by a phone camera rather than an AI-rendered illustration.

The photo treatment includes:

- a natural slightly top-down composition;
- recognizable broth, rice noodles, sliced beef, scallion, herbs, and lime;
- soft warm daylight and a clean crop that works with the Peach Tint field;
- restrained camera corner brackets and a thin Apricot scan line;
- compact lookup callouts for `420 kcal`, `26g đạm`, and `52g carb`;
- the label `AI tra cứu`.

The figures are onboarding examples, not authoritative nutrition results. The body copy explicitly tells users that AI-supported information is reviewable and editable before saving.

## Persistence and Startup

AsyncStorage is the approved local persistence mechanism. The project must add the Expo-compatible `@react-native-async-storage/async-storage` package before implementation.

At startup, the app reads the completion flag before choosing a destination. The splash screen remains visible while this small local check runs so onboarding does not flash before the main app appears.

- Missing or unreadable completion state defaults to onboarding.
- A completion write disables repeated presses while it is pending.
- If the write fails, the current session may still enter the main app, but onboarding may reappear on a later launch. The failure is logged for development without presenting alarming health-related copy.

## Accessibility

- Buttons and text actions retain at least 44 px touch targets.
- The pager exposes the current position as `Màn X trên 3` to screen readers.
- Each slide has a focused illustration description.
- Pagination does not rely on color alone; the active state also changes shape.
- Text remains readable at the approved mobile sizes and respects dynamic layout constraints.
- Swipe is never the only way to advance because the primary button provides an equivalent action.

## Verification

Implementation verification must cover:

- swipe forward and backward across all three slides;
- button-driven movement to the next slide;
- pagination progress and settled state;
- `Tiếp tục` changing to `Bắt đầu` only on slide three;
- `Bỏ qua` and `Bắt đầu` using the same completion flow;
- completed users opening the main app on later launches;
- reduced-motion behavior;
- accessibility labels and touch targets;
- TypeScript, onboarding tests, and `npm run lint`.

## Approved Decisions

- One onboarding route with three slide components.
- `Screen` for the route and `Slide` for pager children.
- Swipe and button navigation are both supported.
- Pagination follows continuous swipe progress.
- Screen three uses realistic phở bò imagery.
- The public feature wording is `tra cứu dinh dưỡng` and the hero label is `AI tra cứu`.
- Skip and Start share a persisted completion action.
- Camera and AI functionality remain outside this implementation.
