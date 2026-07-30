# AURALE Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Expo starter Home route with a mock-data daily nutrition overview and configure the approved four-tab signed-in navigation.

**Architecture:** Define a typed asynchronous `DashboardDataSource`, pure calendar/display helpers, and focused Home components composed by `app/(tabs)/index.tsx`. Keep the selected business date in local React state, use contract-shaped local fixtures, and preserve Expo Router as the navigation owner; no backend, persistence, trend chart, or new dependency is introduced.

**Tech Stack:** Expo SDK 54 (`expo ~54.0.36`), React Native 0.81.5, React 19.1, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, Jest, `react-native-svg` 15.12.1, `react-native-reanimated` 4.1, `lucide-react-native` 1.24.

## Global Constraints

- Read the exact Expo SDK 54 documentation before modifying Expo or React Native code: `https://docs.expo.dev/versions/v54.0.0/`.
- Check the installed NativeWind version and follow `https://www.nativewind.dev/v5/llms-full.txt`; do not upgrade it.
- Use NativeWind classes for static styling; inline styles are limited to SVG/runtime values, ScrollView content containers, safe-area behavior, and pressed transforms.
- Use only fields documented by `GET /api/v1/dashboard?date=YYYY-MM-DD`.
- Do not show a trend chart, exercise calories, remaining calories, streaks, subscription status, or inferred carbohydrate/fat targets.
- Do not add backend calls, AsyncStorage, Zustand state, Supabase changes, or persistent health-data behavior.
- Do not add a dependency. Reuse Expo Router, Reanimated, `react-native-svg`, `lucide-react-native`, and the existing `HapticTab`.
- Home contains no working meal-add, meal-detail, calendar-month, or Insights action in this scope.
- Keep language supportive and neutral; never frame missing meals or nutrition data as failure.
- Maintain 44 px minimum touch targets, visible labels, screen-reader state, text scaling, reduced-motion behavior, and non-color-only meaning.
- Preserve unrelated user changes and do not stage or commit `tmp/`.

---

## File map

**Create:**

```text
types/dashboard.ts
data/dashboard-mock.ts
lib/dashboard-date.ts
lib/dashboard-display.ts
components/home/today-header.tsx
components/home/week-date-picker.tsx
components/home/daily-nutrition-summary.tsx
components/home/recommendation-banner.tsx
components/home/meal-summary-list.tsx
components/home/home-placeholder-state.tsx
app/(tabs)/meals.tsx
app/(tabs)/profile.tsx
__tests__/dashboard-mock-test.ts
__tests__/dashboard-date-test.ts
__tests__/dashboard-display-test.ts
__tests__/home-components-content-test.ts
__tests__/home-screen-content-test.ts
__tests__/home-tabs-test.ts
```

**Modify:**

```text
app/(tabs)/index.tsx
app/(tabs)/explore.tsx
app/(tabs)/_layout.tsx
```

Each file has one responsibility: contract types, mock retrieval, calendar math, display derivation, focused UI concepts, screen orchestration, or tab routing.

---

### Task 1: Dashboard contract types and asynchronous mock data source

**Files:**
- Create: `types/dashboard.ts`
- Create: `data/dashboard-mock.ts`
- Create: `__tests__/dashboard-mock-test.ts`

**Interfaces:**
- Consumes: no feature-specific code.
- Produces: `DashboardData`, `DashboardDataSource`, `dashboardDataSource`, `DASHBOARD_MOCK_TIMEZONE`, and contract-shaped fixtures keyed by `businessDate`.

- [ ] **Step 1: Write the failing mock data-source tests**

Create `__tests__/dashboard-mock-test.ts`:

```ts
import {
  DASHBOARD_MOCK_TIMEZONE,
  dashboardDataSource,
} from '@/data/dashboard-mock';

describe('dashboard mock data source', () => {
  it('returns a defensive copy of a documented dashboard day', async () => {
    const first = await dashboardDataSource.getDashboard('2026-07-30');
    const second = await dashboardDataSource.getDashboard('2026-07-30');

    expect(DASHBOARD_MOCK_TIMEZONE).toBe('Asia/Ho_Chi_Minh');
    expect(first?.businessDate).toBe('2026-07-30');
    expect(first?.nutritionTotals.caloriesKcal).toBe(1850);
    expect(first?.targets.caloriesKcal).toEqual({ min: 1800, max: 2100 });
    expect(first?.topRecommendations[0]?.recommendationCode).toBe('ADD_FIBER');
    expect(first).not.toBe(second);
  });

  it('returns null for an unconfigured day instead of zero-filled nutrition', async () => {
    await expect(
      dashboardDataSource.getDashboard('2026-08-10'),
    ).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- __tests__/dashboard-mock-test.ts
```

Expected: FAIL because `@/data/dashboard-mock` does not exist.

- [ ] **Step 3: Add the contract types**

Create `types/dashboard.ts`:

```ts
export type AssessmentStatus = 'READY' | 'PENDING' | 'FAILED';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type NumericTarget = { min?: number; max?: number };

export type NutrientTotals = {
  caloriesKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  dataCompleteness: number;
};

export type DashboardMeal = {
  mealId: string;
  mealType: MealType;
  eatenAt: string;
  caloriesKcal: number | null;
  assessmentStatus: AssessmentStatus;
  healthyScore: number | null;
  imageThumbnailUrl: string | null;
};

export type DashboardRecommendation = {
  recommendationCode: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  text: string;
};

export type DashboardData = {
  businessDate: string;
  timezone: string;
  nutritionTotals: NutrientTotals;
  targets: { caloriesKcal?: NumericTarget; proteinG?: NumericTarget };
  dailyAssessment: {
    assessmentId: string;
    status: AssessmentStatus;
    score: number | null;
    level: 'NEEDS_ATTENTION' | 'FAIR' | 'GOOD' | 'EXCELLENT' | null;
  } | null;
  meals: DashboardMeal[];
  latestWeight: { valueKg: number; occurredAt: string } | null;
  topRecommendations: DashboardRecommendation[];
};

export interface DashboardDataSource {
  getDashboard(date: string): Promise<DashboardData | null>;
}
```

Keep `latestWeight` typed because it exists in the contract, but do not render it on Home.

- [ ] **Step 4: Implement the minimal mock source**

Create `data/dashboard-mock.ts` with `DASHBOARD_MOCK_TIMEZONE = 'Asia/Ho_Chi_Minh'`, a `Record<string, DashboardData>`, and this boundary:

```ts
function cloneDashboard(data: DashboardData): DashboardData {
  return JSON.parse(JSON.stringify(data)) as DashboardData;
}

export const dashboardDataSource: DashboardDataSource = {
  async getDashboard(date) {
    const fixture = fixtures[date];
    return fixture ? cloneDashboard(fixture) : null;
  },
};
```

The default `2026-07-30` fixture must use the contract sample values: 1850 kcal, 92 g protein, 215 g carbohydrate, 58 g fat, calorie target 1800–2100, protein target 85–120, daily score 74/GOOD, three meals with READY/PENDING states, and one `ADD_FIBER` recommendation. Add other fixtures only when state tests require them; do not expose a fixture switch in UI.

- [ ] **Step 5: Run the focused test and verify GREEN**

```bash
npm test -- __tests__/dashboard-mock-test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add types/dashboard.ts data/dashboard-mock.ts __tests__/dashboard-mock-test.ts
git commit -m "feat: add dashboard mock contract"
```

### Task 2: Timezone-safe business date and calendar-week helpers

**Files:**
- Create: `lib/dashboard-date.ts`
- Create: `__tests__/dashboard-date-test.ts`

**Interfaces:**
- Consumes: IANA timezone strings and `YYYY-MM-DD` calendar dates.
- Produces: `getBusinessDate(now, timezone)`, `getCalendarWeek(date)`, `formatBusinessDateLabel(date)`, `formatMealTime(instant, timezone)`, and `CalendarDay`.

- [ ] **Step 1: Write failing calendar tests**

```ts
import {
  formatBusinessDateLabel,
  formatMealTime,
  getBusinessDate,
  getCalendarWeek,
} from '@/lib/dashboard-date';

test('resolves the Vietnam business date near a UTC boundary', () => {
  expect(
    getBusinessDate(new Date('2026-07-29T18:30:00.000Z'), 'Asia/Ho_Chi_Minh'),
  ).toBe('2026-07-30');
});

test('returns a Monday-through-Sunday week across a month boundary', () => {
  expect(getCalendarWeek('2026-07-30').map((day) => day.date)).toEqual([
    '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30',
    '2026-07-31', '2026-08-01', '2026-08-02',
  ]);
});

test('handles leap day and formats Vietnamese labels', () => {
  expect(getCalendarWeek('2028-02-29').map((day) => day.date)).toContain('2028-02-29');
  expect(formatBusinessDateLabel('2026-07-30')).toContain('30');
  expect(formatMealTime('2026-07-30T12:30:00+07:00', 'Asia/Ho_Chi_Minh')).toBe('12:30');
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm test -- __tests__/dashboard-date-test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement pure calendar helpers**

```ts
export type CalendarDay = {
  date: string;
  weekdayLabel: string;
  dayOfMonth: number;
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseCalendarDate(date: string): Date {
  const match = DATE_PATTERN.exec(date);
  if (!match) throw new Error('Invalid business date');
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
}

export function getBusinessDate(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function getCalendarWeek(date: string): CalendarDay[] {
  const selected = parseCalendarDate(date);
  const weekday = selected.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(selected);
    item.setUTCDate(selected.getUTCDate() + mondayOffset + index);
    return {
      date: item.toISOString().slice(0, 10),
      weekdayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
      dayOfMonth: item.getUTCDate(),
    };
  });
}
```

Add `formatBusinessDateLabel` with Vietnamese `Intl.DateTimeFormat` in UTC and `formatMealTime` with the response timezone.

- [ ] **Step 4: Run test and verify GREEN**

```bash
npm test -- __tests__/dashboard-date-test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard-date.ts __tests__/dashboard-date-test.ts
git commit -m "feat: add dashboard calendar helpers"
```
### Task 3: Display derivations and daily nutrition components

**Files:**
- Create: `lib/dashboard-display.ts`
- Create: `components/home/daily-nutrition-summary.tsx`
- Create: `components/home/recommendation-banner.tsx`
- Create: `__tests__/dashboard-display-test.ts`
- Create: `__tests__/home-components-content-test.ts`

**Interfaces:**
- Consumes: `DashboardData`, `NumericTarget`, and `DashboardRecommendation`.
- Produces: `getCalorieProgress`, `getCompletenessMessage`, `getAssessmentLabel`, `DailyNutritionSummary`, and `RecommendationBanner`.

- [ ] **Step 1: Write failing display-helper tests**

```ts
import {
  getAssessmentLabel,
  getCalorieProgress,
  getCompletenessMessage,
} from '@/lib/dashboard-display';

test('uses only the explicit positive calorie maximum', () => {
  expect(getCalorieProgress(1850, { min: 1800, max: 2100 })).toBeCloseTo(1850 / 2100);
  expect(getCalorieProgress(2200, { max: 2100 })).toBe(1);
  expect(getCalorieProgress(1000, { min: 900 })).toBeNull();
  expect(getCalorieProgress(null, { max: 2100 })).toBeNull();
});

test('turns completeness into supportive copy instead of a percentage', () => {
  expect(getCompletenessMessage(0.86)).toBe('Một số món chưa có đủ dữ liệu dinh dưỡng.');
  expect(getCompletenessMessage(0.96)).toBeNull();
});

test('maps assessment status without calculating a score', () => {
  expect(getAssessmentLabel('PENDING', null)).toBe('Đang cập nhật điểm');
  expect(getAssessmentLabel('FAILED', null)).toBe('Chưa thể cập nhật điểm');
  expect(getAssessmentLabel('READY', 74)).toBe('Điểm 74');
});
```

- [ ] **Step 2: Run helper test and verify RED**

```bash
npm test -- __tests__/dashboard-display-test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement display helpers**

```ts
import type { AssessmentStatus, NumericTarget } from '@/types/dashboard';

export function getCalorieProgress(
  calories: number | null,
  target?: NumericTarget,
): number | null {
  if (calories === null || !target?.max || target.max <= 0) return null;
  return Math.min(Math.max(calories / target.max, 0), 1);
}

export function getCompletenessMessage(value: number): string | null {
  return value < 0.9 ? 'Một số món chưa có đủ dữ liệu dinh dưỡng.' : null;
}

export function getAssessmentLabel(
  status: AssessmentStatus,
  score: number | null,
): string {
  if (status === 'PENDING') return 'Đang cập nhật điểm';
  if (status === 'FAILED') return 'Chưa thể cập nhật điểm';
  return score === null ? 'Điểm chưa có' : `Điểm ${score}`;
}
```

- [ ] **Step 4: Add failing component contract assertions**

Create `__tests__/home-components-content-test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(file: string) {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

test('daily summary uses SVG, contract helpers, and accessible text', () => {
  const summary = source('components/home/daily-nutrition-summary.tsx');
  expect(summary).toContain("from 'react-native-svg'");
  expect(summary).toContain('getCalorieProgress');
  expect(summary).toContain('so với mức tối đa');
  expect(summary).toContain('accessibilityRole="summary"');
  expect(summary).not.toContain('Calo còn lại');
  expect(summary).not.toContain('Tập luyện');
});

test('recommendation displays response text without a press action', () => {
  const recommendation = source('components/home/recommendation-banner.tsx');
  expect(recommendation).toContain('recommendation.text');
  expect(recommendation).not.toContain('Pressable');
  expect(recommendation).not.toContain('onPress');
});
```

- [ ] **Step 5: Run component test and verify RED**

```bash
npm test -- __tests__/home-components-content-test.ts
```

Expected: FAIL because the component files do not exist.

- [ ] **Step 6: Implement summary and recommendation components**

`DailyNutritionSummary` interface:

```ts
type DailyNutritionSummaryProps = Pick<
  DashboardData,
  'nutritionTotals' | 'targets' | 'dailyAssessment'
>;
```

Use `Svg` with background and foreground `Circle` elements. Derive the stroke offset only from `getCalorieProgress`. Keep calories, target range, and `so với mức tối đa` as normal text so the ring is not the sole meaning carrier.

Base structure:

```tsx
<View accessibilityRole="summary" className="rounded-[20px] bg-surface p-5">
  <Text className="text-[13px] font-bold text-soft-slate">
    Dinh dưỡng hôm nay
  </Text>
  {/* calorie ring, numeric value, explicit target range */}
  {/* assessment label from getAssessmentLabel */}
  {/* protein, carbohydrate, fat totals */}
  {/* supportive completeness copy */}
</View>
```

Missing nutrients render `Chưa có dữ liệu`, not `0 g`. Protein may show its supplied range. Carbohydrate and fat never receive inferred targets.

`RecommendationBanner` returns `null` without data and otherwise renders a non-interactive view:

```tsx
export function RecommendationBanner({
  recommendation,
}: {
  recommendation?: DashboardRecommendation;
}) {
  if (!recommendation) return null;
  return (
    <View className="flex-row items-center gap-3 rounded-[17px] bg-[#FFF7DC] p-4">
      <View className="size-9 rounded-[11px] bg-butter" />
      <Text className="min-w-0 flex-1 text-[14px] leading-5 text-ink-navy">
        {recommendation.text}
      </Text>
    </View>
  );
}
```

- [ ] **Step 7: Run focused tests and verify GREEN**

```bash
npm test -- __tests__/dashboard-display-test.ts __tests__/home-components-content-test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/dashboard-display.ts components/home/daily-nutrition-summary.tsx components/home/recommendation-banner.tsx __tests__/dashboard-display-test.ts __tests__/home-components-content-test.ts
git commit -m "feat: add daily nutrition summary"
```

### Task 4: Date controls, meal list, and shared Home states

**Files:**
- Create: `components/home/today-header.tsx`
- Create: `components/home/week-date-picker.tsx`
- Create: `components/home/meal-summary-list.tsx`
- Create: `components/home/home-placeholder-state.tsx`
- Modify: `__tests__/home-components-content-test.ts`

**Interfaces:**
- Consumes: `CalendarDay`, date helpers, `DashboardMeal[]`, selected/today date keys, and retry callback.
- Produces: `TodayHeader`, `WeekDatePicker`, `MealSummaryList`, `HomeLoadingState`, `HomeEmptyState`, and `HomeErrorState`.

- [ ] **Step 1: Add failing component behavior assertions**

```ts
test('week picker exposes today and selected state without a month calendar', () => {
  const picker = source('components/home/week-date-picker.tsx');
  expect(picker).toContain('accessibilityRole="button"');
  expect(picker).toContain('accessibilityState={{ selected: isSelected }}');
  expect(picker).toContain("accessibilityHint={isToday ? 'Hôm nay' : undefined}");
  expect(picker).not.toContain('Modal');
  expect(picker).not.toContain('DateTimePicker');
});

test('meal rows expose status text but are not pressable', () => {
  const meals = source('components/home/meal-summary-list.tsx');
  expect(meals).toContain('formatMealTime');
  expect(meals).toContain("PENDING");
  expect(meals).toContain("FAILED");
  expect(meals).not.toContain('Pressable');
  expect(meals).not.toContain('onPress');
});

test('shared states provide skeleton, neutral empty copy, and retry', () => {
  const states = source('components/home/home-placeholder-state.tsx');
  expect(states).toContain('Chưa có bữa ăn nào trong ngày này');
  expect(states).toContain('Chưa tải được dữ liệu của ngày này.');
  expect(states).toContain('Thử lại');
  expect(states).toContain('accessibilityLiveRegion="polite"');
  expect(states).not.toContain('ActivityIndicator');
});
```

- [ ] **Step 2: Run focused test and verify RED**

```bash
npm test -- __tests__/home-components-content-test.ts
```

Expected: FAIL because the new component files do not exist.

- [ ] **Step 3: Implement `TodayHeader` and `WeekDatePicker`**

```ts
type TodayHeaderProps = {
  selectedDate: string;
  today: string;
  onReturnToToday: () => void;
};

type WeekDatePickerProps = {
  days: CalendarDay[];
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
};
```

Render `Về hôm nay` only when the dates differ. It is a quiet `Pressable` with a 44 px target. Do not render a standalone calendar icon.

Use seven equal date pressables. Selected state uses Peach Tint plus Apricot border; unselected labels use Soft Slate. Add a non-color today cue. Do not add a modal or swipe gesture.

- [ ] **Step 4: Implement meals and shared states**

Sort without mutating:

```ts
const orderedMeals = [...meals].sort((left, right) =>
  left.eatenAt.localeCompare(right.eatenAt),
);
```

Use exhaustive localized labels:

```ts
const mealTypeLabels: Record<MealType, string> = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Bữa phụ',
};
```

Rows are static `View` elements. Missing calories render `Chưa có dữ liệu`. READY shows score, PENDING shows `Đang cập nhật`, and FAILED shows `Chưa thể phân tích`.

Create skeletons from neutral blocks matching the destination. `HomeErrorState` has an accessible `Thử lại` pressable. `HomeEmptyState` has no meal-add CTA.

- [ ] **Step 5: Run focused test and verify GREEN**

```bash
npm test -- __tests__/home-components-content-test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/home/today-header.tsx components/home/week-date-picker.tsx components/home/meal-summary-list.tsx components/home/home-placeholder-state.tsx __tests__/home-components-content-test.ts
git commit -m "feat: add home day and meal components"
```

### Task 5: Compose the asynchronous Home route

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `__tests__/home-screen-content-test.ts`

**Interfaces:**
- Consumes: `dashboardDataSource`, `DASHBOARD_MOCK_TIMEZONE`, date helpers, and all `components/home/*` exports.
- Produces: the complete mock-data Home route with local selected-date, loading, empty, error, and ready states.

- [ ] **Step 1: Write failing Home route assertions**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(
  join(process.cwd(), 'app', '(tabs)', 'index.tsx'),
  'utf8',
);

test('composes Home from the approved mock data source', () => {
  expect(source).toContain('dashboardDataSource.getDashboard(selectedDate)');
  expect(source).toContain('getBusinessDate');
  expect(source).toContain('getCalendarWeek(selectedDate)');
  expect(source).toContain('<TodayHeader');
  expect(source).toContain('<WeekDatePicker');
  expect(source).toContain('<DailyNutritionSummary');
  expect(source).toContain('<RecommendationBanner');
  expect(source).toContain('<MealSummaryList');
});

test('supports states without trends or persistence', () => {
  expect(source).toContain('<HomeLoadingState');
  expect(source).toContain('<HomeEmptyState');
  expect(source).toContain('<HomeErrorState');
  expect(source).toContain('contentInsetAdjustmentBehavior="automatic"');
  expect(source).not.toContain('dashboard/trends');
  expect(source).not.toContain('AsyncStorage');
  expect(source).not.toContain('useDashboardStore');
  expect(source).not.toContain('AddMeal');
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm test -- __tests__/home-screen-content-test.ts
```

Expected: FAIL because the route still contains the Expo starter.

- [ ] **Step 3: Replace the starter with one authoritative async request path**

Use a discriminated state:

```ts
type HomeState =
  | { status: 'loading' }
  | { status: 'ready'; data: DashboardData }
  | { status: 'empty' }
  | { status: 'error' };
```

Initialize:

```ts
const today = useMemo(
  () => getBusinessDate(new Date(), DASHBOARD_MOCK_TIMEZONE),
  [],
);
const [selectedDate, setSelectedDate] = useState(today);
const [state, setState] = useState<HomeState>({ status: 'loading' });
const [reloadVersion, setReloadVersion] = useState(0);
```

Use one effect with stale-response protection for both selection and retry:

```ts
useEffect(() => {
  let active = true;
  setState({ status: 'loading' });

  dashboardDataSource
    .getDashboard(selectedDate)
    .then((data) => {
      if (active) {
        setState(data ? { status: 'ready', data } : { status: 'empty' });
      }
    })
    .catch(() => {
      if (active) setState({ status: 'error' });
    });

  return () => {
    active = false;
  };
}, [selectedDate, reloadVersion]);
```

Retry increments `reloadVersion`. Date selection only updates local state.

Compose inside a first-child `ScrollView` with `contentInsetAdjustmentBehavior="automatic"`, constrained width, 20–24 px horizontal padding, and bottom padding clearing the tab bar.

Ready order:

```tsx
<TodayHeader />
<WeekDatePicker />
<DailyNutritionSummary />
<RecommendationBanner recommendation={data.topRecommendations[0]} />
<MealSummaryList meals={data.meals} timezone={data.timezone} />
```

Do not add a chart, calendar modal, Insights link, or meal action.

- [ ] **Step 4: Run focused tests and verify GREEN**

```bash
npm test -- __tests__/home-screen-content-test.ts __tests__/home-components-content-test.ts
```

Expected: PASS.

- [ ] **Step 5: Run TypeScript and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add 'app/(tabs)/index.tsx' __tests__/home-screen-content-test.ts
git commit -m "feat: build mock dashboard home"
```

### Task 6: Configure the approved four-tab navigation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/explore.tsx`
- Create: `app/(tabs)/meals.tsx`
- Create: `app/(tabs)/profile.tsx`
- Create: `__tests__/home-tabs-test.ts`

**Interfaces:**
- Consumes: Expo Router `Tabs`, existing `HapticTab`, AURALE colors, and installed Lucide icons.
- Produces: four signed-in destinations labeled `Hôm nay`, `Phân tích`, `Bữa ăn`, and `Bạn`.

- [ ] **Step 1: Write failing navigation assertions**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const layout = readFileSync(join(root, 'app', '(tabs)', '_layout.tsx'), 'utf8');

it('defines exactly the four approved tabs', () => {
  expect(layout).toContain('name="index"');
  expect(layout).toContain("title: 'Hôm nay'");
  expect(layout).toContain('name="explore"');
  expect(layout).toContain("title: 'Phân tích'");
  expect(layout).toContain('name="meals"');
  expect(layout).toContain("title: 'Bữa ăn'");
  expect(layout).toContain('name="profile"');
  expect(layout).toContain("title: 'Bạn'");
  expect(layout.match(/<Tabs\.Screen/g)).toHaveLength(4);
});

it('uses AURALE styling, Lucide icons, and existing haptics', () => {
  expect(layout).toContain('HapticTab');
  expect(layout).toContain('House');
  expect(layout).toContain('ChartNoAxesColumnIncreasing');
  expect(layout).toContain('Soup');
  expect(layout).toContain('UserRound');
  expect(layout).toContain('#FF9E7A');
  expect(layout).toContain('#697386');
  expect(layout).toContain('#FFF0E7');
});

it.each([
  ['explore.tsx', 'Phân tích'],
  ['meals.tsx', 'Bữa ăn'],
  ['profile.tsx', 'Bạn'],
])('%s is an explicit placeholder without fake health data', (file, title) => {
  const route = readFileSync(join(root, 'app', '(tabs)', file), 'utf8');
  expect(route).toContain(title);
  expect(route).toContain('contentInsetAdjustmentBehavior="automatic"');
  expect(route).not.toContain('caloriesKcal');
  expect(route).not.toContain('healthyScore');
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm test -- __tests__/home-tabs-test.ts
```

Expected: FAIL because only two starter tabs exist.

- [ ] **Step 3: Configure `_layout.tsx`**

Keep the existing auth redirect. Import `House`, `ChartNoAxesColumnIncreasing`, `Soup`, and `UserRound`. Render each at `size={23}` and `strokeWidth={2}`.

Use:

```tsx
screenOptions={{
  headerShown: false,
  tabBarButton: HapticTab,
  tabBarActiveTintColor: '#FF9E7A',
  tabBarInactiveTintColor: '#697386',
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E7DDD3',
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
  },
}}
```

The focused icon sits on a small Peach Tint rounded surface; inactive uses a transparent surface. Keep a 44 px icon wrapper and let the navigator manage selected semantics and safe area.

- [ ] **Step 4: Replace Explore and add placeholder routes**

Each route starts with a `ScrollView` using automatic content insets, Cloud Canvas background, constrained width, and approved copy:

```tsx
<Text className="font-rounded text-[30px] font-extrabold text-ink-navy">
  Phân tích
</Text>
<Text className="mt-3 text-[16px] leading-6 text-soft-slate">
  Xu hướng dinh dưỡng của bạn sẽ xuất hiện tại đây.
</Text>
```

Use equivalent approved copy for Meals and You. Do not add actions or fake data.

- [ ] **Step 5: Run test and verify GREEN**

```bash
npm test -- __tests__/home-tabs-test.ts
```

Expected: PASS.

- [ ] **Step 6: Run route verification**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add 'app/(tabs)/_layout.tsx' 'app/(tabs)/explore.tsx' 'app/(tabs)/meals.tsx' 'app/(tabs)/profile.tsx' __tests__/home-tabs-test.ts
git commit -m "feat: configure four home tabs"
```

### Task 7: Accessibility, responsive contract, and full verification

**Files:**
- Modify: `__tests__/home-components-content-test.ts`
- Modify: `__tests__/home-screen-content-test.ts`
- Modify only if tests expose gaps: `components/home/*.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: the completed Home route and four-tab navigation.
- Produces: regression coverage for accessibility, responsive behavior, banned data, and final verified implementation.

- [ ] **Step 1: Add failing final contract assertions**

Add focused source-contract assertions:

```ts
expect(homeSource).toContain('useWindowDimensions');
expect(homeSource).toContain('fontScale');
expect(homeSource).toContain('useReducedMotion');
expect(homeSource).toContain('max-w-[520px]');
expect(allHomeSources).toContain('accessibilityLiveRegion="polite"');
expect(allHomeSources).toContain('fontVariant');
expect(allHomeSources).not.toContain('Calo còn lại');
expect(allHomeSources).not.toContain('Tập luyện');
expect(allHomeSources).not.toContain('streak');
expect(allHomeSources).not.toContain('Nâng cấp gói');
expect(allHomeSources).not.toContain('dashboard/trends');
```

Add one assertion proving the macro row has a narrow/large-font stacking branch, for example `const stackMacros = width < 380 || fontScale >= 1.35` and both `flex-row`/`flex-col` classes.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npm test -- __tests__/home-components-content-test.ts __tests__/home-screen-content-test.ts __tests__/home-tabs-test.ts
```

Expected: FAIL for at least one missing accessibility or responsive contract. If every new assertion passes immediately, replace the assertion with one covering a real uncovered requirement before continuing; the test must demonstrate RED.

- [ ] **Step 3: Apply minimal accessibility/responsive fixes**

Use `useWindowDimensions()` and `fontScale` to stack macro items before clipping. Use `useReducedMotion()` to remove ring-entry movement. Apply tabular numerals through the allowed runtime style:

```tsx
style={{ fontVariant: ['tabular-nums'] }}
```

Dynamic assessment/error text uses `accessibilityLiveRegion="polite"`. Do not shrink body text below 14 px or touch targets below 44 px.

- [ ] **Step 4: Run the complete Home test set**

```bash
npm test -- __tests__/dashboard-mock-test.ts __tests__/dashboard-date-test.ts __tests__/dashboard-display-test.ts __tests__/home-components-content-test.ts __tests__/home-screen-content-test.ts __tests__/home-tabs-test.ts
```

Expected: PASS with 0 failed tests.

- [ ] **Step 5: Run full project verification**

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all commands exit 0 with no failed tests, TypeScript errors, lint errors, or whitespace errors.

- [ ] **Step 6: Perform proportional visual verification**

Start Expo without changing dependencies:

```bash
npm run web
```

Inspect a narrow phone viewport and a wider web viewport:

- Header and week strip remain readable.
- Selected date and today remain distinguishable without color alone.
- Macro content stacks before clipping.
- Scrolling clears the bottom tab bar.
- Ready, empty, and error fixtures preserve visual hierarchy.
- All four tabs are reachable and placeholders contain no fake data.

Stop the development server after inspection.

- [ ] **Step 7: Commit final verification fixes**

If Step 3 changed files:

```bash
git add __tests__/home-components-content-test.ts __tests__/home-screen-content-test.ts components/home 'app/(tabs)/index.tsx' 'app/(tabs)/_layout.tsx'
git commit -m "test: verify home accessibility states"
```

If no production adjustment was needed, commit only meaningful new regression assertions. Do not create an empty commit.
