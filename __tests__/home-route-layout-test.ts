import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(file: string) {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

test('uses the shared viewport layout without scrolling or enlarged hit areas', () => {
  const picker = source('components/home/week-date-picker.tsx');

  expect(picker).toContain('useWindowDimensions');
  expect(picker).toContain('getWeekDatePickerLayout(width)');
  expect(picker).toContain('width: layout.stripWidth');
  expect(picker).toContain('marginHorizontal: layout.horizontalMargin');
  expect(picker).not.toContain('ScrollView');
  expect(picker).not.toContain('hitSlop');
});

test('renders the ready Home sections in the approved order', () => {
  const route = source('app/(tabs)/index.tsx');

  expect(route.indexOf('<TodayHeader')).toBeLessThan(route.indexOf('<WeekDatePicker'));
  expect(route.indexOf('<WeekDatePicker')).toBeLessThan(
    route.indexOf('<DailyNutritionSummary'),
  );
  expect(route.indexOf('<DailyNutritionSummary')).toBeLessThan(
    route.indexOf('<RecommendationBanner'),
  );
  expect(route.indexOf('<RecommendationBanner')).toBeLessThan(route.indexOf('<MealSummaryList'));
});
