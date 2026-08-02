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

test('consumes the shared content-width contract and keeps tab clearance', () => {
  expect(source).toContain('HOME_CONTENT_LAYOUT');
  expect(source).toContain('HOME_CONTENT_LAYOUT.maxWidthClassName');
  expect(source).not.toContain('max-w-[520px]');
  expect(source).toContain('px-5 pb-28 pt-6');
  expect(source).not.toContain('height:');
});
