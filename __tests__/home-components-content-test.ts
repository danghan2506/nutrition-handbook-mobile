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
