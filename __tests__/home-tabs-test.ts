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
