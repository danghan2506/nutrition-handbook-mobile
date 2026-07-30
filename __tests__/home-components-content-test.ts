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
  expect(meals).toContain('PENDING');
  expect(meals).toContain('FAILED');
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
test('week picker reserves a 44 by 44 target for each visible day', () => {
  const picker = source('components/home/week-date-picker.tsx');
  expect(picker).toContain('h-11 w-11');
  expect(picker).toContain('justify-between');
  expect(picker).not.toContain('flex-1');
});