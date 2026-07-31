import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(file: string) {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

test('keeps all seven date targets responsive inside a narrow full-bleed strip', () => {
  const route = source('app/(tabs)/index.tsx');
  const picker = source('components/home/week-date-picker.tsx');

  expect(route).toContain('className="-mx-5"');
  expect(picker).toContain('w-full max-w-[308px]');
  expect(picker).toContain('h-11 min-w-11 flex-1');
  expect(picker).not.toMatch(/className="w-\[308px\]/);
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
