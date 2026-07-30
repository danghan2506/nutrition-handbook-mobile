# AURALE Home Screen Design

**Date:** 2026-07-30
**Status:** Approved
**Scope:** Mock-data Home screen and four-tab signed-in navigation

## Purpose

Replace the Expo starter Home route with a calm daily nutrition overview that
matches the existing AURALE design system and the documented Dashboard API
contract.

This specification approves a local mock-data implementation only. It does not
approve backend integration, persistence, nutrition calculations, activity
calorie adjustments, subscriptions, streaks, or the detailed design of the
Insights, Meals, or You screens.

## Approved product decisions

- Home represents one selected `businessDate`.
- Home uses only fields defined by `GET /api/v1/dashboard?date=YYYY-MM-DD`.
- Local mock data must follow the documented Dashboard response shape so a
  future data-source replacement does not require a UI rewrite.
- Home does not show a seven-day chart. Trend charts belong in the future
  `Phân tích` tab.
- Home does not call or mock the Dashboard Trends endpoint.
- Home does not show exercise calories, remaining calories, logging streaks, or
  subscription status because those values are not part of the Dashboard
  response.
- Activity records remain outside Home because they require a separate tracking
  endpoint.
- The signed-in navigation has four tabs: `Hôm nay`, `Phân tích`, `Bữa ăn`, and
  `Bạn`.
- Only Home is implemented as a complete feature in this scope. The other three
  routes use intentional placeholder screens.
- Home does not expose a `Xem phân tích` action until the Insights screen has
  its own approved design.

## Information hierarchy

Home follows this order:

```text
Today header
Week date selector
Daily nutrition summary
Top recommendation, when available
Meals recorded for the selected day
Four-tab navigation
```

The screen intentionally contains one major summary card and light supporting
sections. It must not become a dense dashboard.

## Visual direction

Follow `DESIGN.md` and the existing NativeWind theme:

- Cloud Canvas (`#FFF9F0`) for the screen.
- Clean Surface (`#FFFFFF`) for the main summary and meal grouping.
- Ink Navy (`#2F3542`) for primary text.
- Soft Slate (`#697386`) for dates, metadata, and inactive navigation.
- Peach Tint (`#FFF0E7`) for the selected date and active-tab indicator.
- Apricot Action (`#FF9E7A`) for the selected date outline and active tab.
- Leaf Support (`#9BCB8D`) for a known, in-range positive progress state.
- Butter Highlight (`#FFD66B`) for the recommendation marker.
- Quiet Dot (`#E7DDD3`) for restrained separators.

The date selector must be lighter than the initial visual companion mockup:

- Unselected labels use Soft Slate.
- The selected date uses Peach Tint with an Apricot outline.
- Avoid dark filled calendar controls.
- The external dark device frame shown in the visual companion is not part of
  the application.

Use the existing rounded system typography and tabular numerals for nutrition
values. Do not introduce new fonts.

## Screen composition

### Today header

The header contains:

- Context date, for example `Thứ Năm, 30 tháng 7`.
- Screen title `Hôm nay` when the selected business date is today.
- Screen title `Ngày đã chọn` when viewing another date.
- A quiet text action `Về hôm nay` only when the selected date is not today.

Do not render a standalone calendar icon with no implemented calendar action.
The week strip is the date-selection control in this scope.

### Week date selector

Display the Monday-through-Sunday calendar week containing `selectedDate`.

Each item shows:

- Vietnamese weekday abbreviation.
- Numeric day of month.
- Selected state through background, outline, and accessible selected state.
- A subtle non-color indicator for today when today is not selected.

Selecting a day updates `selectedDate` and requests the corresponding mock
dashboard record.

The control does not implement:

- A full month calendar.
- Date-range selection.
- Swipe gestures between weeks.
- A third-party date picker.

Those behaviors require a separate design decision.

### Daily nutrition summary

The major card consumes:

```ts
nutritionTotals
targets
dailyAssessment
```

It displays:

- Logged calories for the selected day.
- The documented calorie target range.
- Daily Healthy Score and level when the assessment is ready.
- Protein, carbohydrate, and fat totals.
- A protein target range when supplied.

The calorie ring is presentational only:

```text
progress = clamp(caloriesKcal / targets.caloriesKcal.max, 0, 1)
```

Only calculate it when a positive upper target exists. Label the relationship
as `so với mức tối đa` so it is not presented as remaining calories or a
clinical judgment.

Do not derive:

- Remaining calories.
- Exercise adjustments.
- A single target from the midpoint of a range.
- Carbohydrate or fat targets when the response does not contain them.

For protein, show the supplied target range as text. A small progress track may
use the positive upper bound only when it is explicitly labeled. Carbohydrate
and fat remain plain totals while their targets are absent.

Do not show raw `dataCompleteness` as a precision score. Use it only to support
a calm data-quality message:

- Complete enough: no message.
- Partially complete: `Một số món chưa có đủ dữ liệu dinh dưỡng.`
- No usable nutrition data: use the empty state.

### Daily assessment states

Handle the documented assessment states:

- `READY`: show score and level.
- `PENDING`: show `Đang cập nhật điểm`.
- `FAILED`: show `Chưa thể cập nhật điểm` without blocking the rest of Home.
- Missing assessment: omit the badge.

The client does not calculate Healthy Score.

### Recommendation banner

Home displays at most one item:

```ts
dashboard.topRecommendations[0]
```

The text comes directly from the backend-shaped mock response. Mobile does not
inspect nutrients to create advice and does not call an LLM.

Behavior:

- Non-empty array: display the highest-priority item.
- Empty array: remove the banner and its spacing.
- Pending assessment with no recommendation: do not invent a loading sentence
  unless the response explicitly indicates recommendation processing.

The banner is informative in this scope and has no trailing chevron or press
behavior.

### Meal summary list

Render `meals[]` for the selected day in chronological order using:

```ts
mealId
mealType
eatenAt
caloriesKcal
assessmentStatus
healthyScore
imageThumbnailUrl
```

Each row displays:

- Localized meal type.
- Local time derived from `eatenAt`.
- Calories when known.
- Assessment status or Healthy Score.

Assessment labels:

- `READY`: `Điểm {healthyScore}` when a score exists.
- `PENDING`: `Đang cập nhật`.
- `FAILED`: `Chưa thể phân tích`.

Do not navigate meal rows until a meal-detail route is designed. Rows must not
appear pressable in this scope.

Do not include a working `Thêm bữa ăn` button in this Home-only implementation
because no approved meal-creation route exists. The action can be added when
the Meal Tracking flow is designed. This avoids a dead primary action or a
misleading navigation target.

## Date behavior

### Business date

Do not initialize today with:

```ts
new Date().toISOString().slice(0, 10)
```

That expression uses UTC and can return the wrong calendar day near midnight.

The mock data source uses the documented timezone:

```text
Asia/Ho_Chi_Minh
```

Use `Intl.DateTimeFormat(...).formatToParts()` to resolve the current
`YYYY-MM-DD` business date in that timezone.

Future API integration must replace the mock timezone with the authenticated
user's resolved timezone before issuing the first dated dashboard request.

### Calendar arithmetic

Treat `YYYY-MM-DD` values as calendar dates, not timestamps. Pure TypeScript
helpers should:

- Parse the three date parts.
- Use a UTC calendar anchor for addition and weekday calculation.
- Return stable `YYYY-MM-DD` keys.
- Generate the Monday-through-Sunday week containing the selected date.
- Format weekday and date labels in Vietnamese.

The helpers must handle month boundaries, year boundaries, and leap years.

### Selecting a date

```text
Press week item
→ set selectedDate
→ request dashboardDataSource.getDashboard(selectedDate)
→ render loading state
→ render ready, empty, or error state
```

The selected date is temporary local React state. Do not persist it with
AsyncStorage or Zustand.

## Mock data contract

Define focused TypeScript types matching the documented Dashboard response.
The default fixture should include:

- A ready day with calorie and protein targets.
- Three meals with mixed assessment states.
- One recommendation.
- A partially complete nutrition snapshot.

Additional fixtures support verification:

- Empty day.
- Assessment pending.
- Assessment failed.
- Missing recommendation.
- Missing calorie target.
- Missing nutrient values.
- Load failure.

Use an asynchronous data-source boundary:

```ts
interface DashboardDataSource {
  getDashboard(date: string): Promise<DashboardData | null>;
}
```

The mock implementation resolves fixture data by `businessDate`. A missing
fixture returns `null` and renders the empty day, not fabricated zero totals.

Future API integration can implement the same interface with
`GET /api/v1/dashboard?date=...`.

## Loading, empty, and error states

### Loading

Use skeleton blocks matching:

- Header date strip.
- Nutrition summary card.
- Meal rows.

Do not use a full-screen circular spinner as the primary loading state.

### Empty day

Use neutral copy:

```text
Chưa có bữa ăn nào trong ngày này
Các bữa bạn ghi sẽ xuất hiện ở đây.
```

Do not show zero-filled macro progress as if complete nutrition data exists.
Do not show a primary add action until the meal-creation flow is approved.

### Error

Keep the selected date visible and show:

```text
Chưa tải được dữ liệu của ngày này.
Thử lại
```

Retry calls the same mock data-source method. The error must be inline and must
not expose internal details.

## Four-tab navigation

Reuse the existing Expo Router `Tabs` navigator in `app/(tabs)/_layout.tsx`.
Do not build a custom navigation engine.

Routes:

```text
index.tsx    → Hôm nay
explore.tsx  → Phân tích
meals.tsx    → Bữa ăn
profile.tsx  → Bạn
```

`explore.tsx` is reused as the `Phân tích` route. Add `meals.tsx` and
`profile.tsx` as focused placeholders.

Use the already-installed `lucide-react-native` icons with a consistent
23-pixel size and medium stroke:

- `House` for Hôm nay.
- `ChartNoAxesColumnIncreasing` for Phân tích.
- `Soup` or the closest available food icon for Bữa ăn.
- `UserRound` for Bạn.

Tab visual states:

- Active icon: Apricot Action.
- Active indicator: small Peach Tint surface.
- Active label: Apricot-aligned dark text with increased weight.
- Inactive icon and label: Soft Slate.
- Tab background: Clean Surface.
- Top divider: Quiet Dot.

Maintain at least a 44-pixel touch target and let the navigator account for the
bottom safe area. Continue using the existing `HapticTab` behavior.

Placeholder tabs use calm, explicit copy and no fake data:

```text
Phân tích
Xu hướng dinh dưỡng của bạn sẽ xuất hiện tại đây.

Bữa ăn
Các bữa đã ghi sẽ được tập hợp tại đây.

Bạn
Hồ sơ và tùy chọn cá nhân sẽ xuất hiện tại đây.
```

## Component and file boundaries

Planned files:

```text
app/(tabs)/
  _layout.tsx
  index.tsx
  explore.tsx
  meals.tsx
  profile.tsx

components/home/
  today-header.tsx
  week-date-picker.tsx
  daily-nutrition-summary.tsx
  recommendation-banner.tsx
  meal-summary-list.tsx
  home-placeholder-state.tsx

data/
  dashboard-mock.ts

lib/
  dashboard-date.ts

types/
  dashboard.ts
```

Keep route files focused on composition and screen-level state. Date arithmetic
belongs in pure helpers. Do not extract tiny one-use elements beyond the clear
UI concepts listed above.

No global store, persistence layer, backend client, new navigation
architecture, or additional dependency is approved.

## Responsive behavior

- The root content scrolls vertically.
- Respect top and bottom safe areas.
- Use 20–24 px horizontal padding and the established spacing scale.
- Keep the major card in one column on phones.
- Allow macro values to wrap or stack when text scaling makes three columns
  unreadable.
- Constrain content width on tablet and web.
- Never clip content behind the tab bar.

## Accessibility

- Every date item has an accessible date label and selected state.
- Today is announced independently of selection.
- Nutrition values use readable unit labels and tabular figures.
- The calorie ring has a text equivalent; meaning does not rely on the arc.
- Recommendation text is normal readable content, not color-only status.
- Assessment loading and error changes use an appropriate live region.
- Tab labels remain visible and expose selected state through the navigator.
- Touch targets are at least 44 px.
- Reduced motion replaces progress-entry animation with a fade or immediate
  value.

## Motion

- Week selection may use a short opacity or scale transition.
- The calorie ring may animate once from zero to its resolved value.
- Use transform and opacity only.
- Respect reduced-motion preferences.
- Do not animate continuously or use motion to pressure the user.

## Verification criteria

The implementation is acceptable when:

- The Expo starter Home content is absent.
- Home renders from the mock `DashboardDataSource`.
- Today's business date is correct for `Asia/Ho_Chi_Minh`.
- The week selector starts on Monday and crosses month/year boundaries safely.
- Selecting another date reloads the corresponding fixture.
- Empty, loading, error, pending-assessment, failed-assessment, and incomplete
  nutrition states are supported.
- Calories and protein use only targets supplied by the contract.
- No remaining calories, exercise calories, streak, subscription, or inferred
  carb/fat targets appear.
- Recommendation content comes only from `topRecommendations`.
- Home contains no trend chart or link to an unfinished Insights feature.
- Four tabs render with the approved labels and active/inactive states.
- Placeholder tabs contain no fake health data.
- Screen-reader labels, selected states, touch targets, text scaling, reduced
  motion, and small phone layouts are verified.
- Focused tests, the full Jest suite, TypeScript checking, lint, and
  `git diff --check` pass.

## Out of scope

- Dashboard or Trends API integration.
- The detailed Insights screen and all trend charts.
- Meal creation, meal editing, or meal detail navigation.
- Profile editing.
- Activity tracking or exercise-calorie calculations.
- Streaks, subscriptions, hydration, sleep, weight trends, or habit tracking.
- AsyncStorage, Zustand, Supabase schema changes, or any persistent health-data
  behavior.
- A full month calendar or third-party date picker.
- New dependencies.
