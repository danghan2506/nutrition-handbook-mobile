import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as DailyNutritionSummaryModule from '@/components/home/daily-nutrition-summary';

function source(file: string) {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

const homeComponentFiles = [
  'components/home/daily-nutrition-summary.tsx',
  'components/home/home-placeholder-state.tsx',
  'components/home/meal-summary-list.tsx',
  'components/home/recommendation-banner.tsx',
  'components/home/today-header.tsx',
  'components/home/week-date-picker.tsx',
];
const homeSurfaceFiles = [
  ...homeComponentFiles,
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/explore.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/meals.tsx',
  'app/(tabs)/profile.tsx',
  'data/dashboard-mock.ts',
  'lib/dashboard-date.ts',
  'lib/dashboard-display.ts',
  'lib/home-dashboard-request.ts',
  'lib/week-date-picker-layout.ts',
  'types/dashboard.ts',
];
const allHomeComponentSources = homeComponentFiles.map(source).join('\n');
const allHomeSurfaceSources = homeSurfaceFiles.map(source).join('\n');

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

test('week picker exposes a named radio group with checked state', () => {
  const picker = source('components/home/week-date-picker.tsx');
  expect(picker).toContain('accessibilityRole="radiogroup"');
  expect(picker).toContain('accessibilityLabel="Chọn ngày trong tuần"');
  expect(picker).toContain('accessibilityRole="radio"');
  expect(picker).toContain('accessibilityState={{ checked: isSelected }}');
  expect(picker).not.toContain('accessibilityState={{ selected:');
  expect(picker).toContain("accessibilityHint={isToday ? 'Hôm nay' : undefined}");
  expect(picker).not.toContain('Modal');
  expect(picker).not.toContain('DateTimePicker');
});

test('meal rows expose readable status text but are not pressable', () => {
  const meals = source('components/home/meal-summary-list.tsx');
  expect(meals).toContain('formatMealTime');
  expect(meals).toContain('PENDING');
  expect(meals).toContain('FAILED');
  expect(meals).toContain('className="mt-3 text-[14px] text-soft-slate"');
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

test('week picker gives each visible day an equal, growing 44px-minimum target', () => {
  const picker = source('components/home/week-date-picker.tsx');
  expect(picker).toContain('min-h-11 min-w-11 flex-1');
  expect(picker).not.toContain('className={`h-11 min-w-11');
  expect(picker).toContain("isToday ? 'text-terracotta' : 'text-transparent'");
  expect(picker).toContain('getWeekDatePickerLayout(width)');
  expect(picker).toContain('width: layout.stripWidth');
  expect(picker).not.toContain('justify-between');
});

test.each([
  { width: 379, fontScale: 1, expected: true },
  { width: 380, fontScale: 1.35, expected: true },
  { width: 380, fontScale: 1.34, expected: false },
])(
  'macro summary stacking is $expected at width $width and font scale $fontScale',
  ({ width, fontScale, expected }) => {
    const shouldStackMacros = (
      DailyNutritionSummaryModule as unknown as {
        shouldStackMacros?: (viewportWidth: number, scale: number) => boolean;
      }
    ).shouldStackMacros;

    expect(shouldStackMacros).toBeDefined();
    expect(shouldStackMacros?.(width, fontScale)).toBe(expected);
  },
);

test.each([
  { reduceMotion: true, expected: false },
  { reduceMotion: false, expected: true },
])(
  'ring animation decision is $expected when reduced motion is $reduceMotion',
  ({ reduceMotion, expected }) => {
    const shouldAnimateNutritionRing = (
      DailyNutritionSummaryModule as unknown as {
        shouldAnimateNutritionRing?: (isReducedMotion: boolean) => boolean;
      }
    ).shouldAnimateNutritionRing;

    expect(shouldAnimateNutritionRing).toBeDefined();
    expect(shouldAnimateNutritionRing?.(reduceMotion)).toBe(expected);
  },
);

test('Home components own responsive, reduced-motion, and numeric accessibility', () => {
  const summary = source('components/home/daily-nutrition-summary.tsx');

  expect(summary).toContain('useWindowDimensions');
  expect(summary).toContain('fontScale');
  expect(summary).toContain('useReducedMotion');
  expect(summary).toContain('shouldAnimateNutritionRing(reduceMotion)');
  expect(summary).toContain('entering={ringEntering}');
  expect(summary).toContain("stackMacros ? 'flex-col");
  expect(summary).toContain(": 'flex-row");
  expect(summary).toContain(
    'className="mt-5 text-[14px] leading-5 text-soft-slate"',
  );
  expect(allHomeComponentSources).toContain('accessibilityLiveRegion="polite"');
  expect(allHomeComponentSources).toContain('fontVariant');
  expect(summary).toMatch(/accessibilityLiveRegion="polite"[\s\S]*style={{ fontVariant/);
});

test('the complete Home surface excludes unapproved or pressuring content', () => {
  expect(allHomeSurfaceSources).not.toContain('Calo còn lại');
  expect(allHomeSurfaceSources).not.toContain('Tập luyện');
  expect(allHomeSurfaceSources).not.toContain('streak');
  expect(allHomeSurfaceSources).not.toContain('Nâng cấp gói');
  expect(allHomeSurfaceSources).not.toContain('dashboard/trends');
});
