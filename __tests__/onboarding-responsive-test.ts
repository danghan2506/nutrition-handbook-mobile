import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const slideFiles = [
  'meal-tracking-slide.tsx',
  'gentle-habits-slide.tsx',
  'vietnamese-food-ai-slide.tsx',
] as const;

describe('onboarding responsive slides', () => {
  it.each(slideFiles)('%s can scroll vertically on short screens', (fileName) => {
    const source = readFileSync(
      join(process.cwd(), 'components', 'onboarding', fileName),
      'utf8',
    );

    expect(source).toContain('ScrollView');
    expect(source).toContain('contentContainerStyle={{ flexGrow: 1 }}');
    expect(source).toContain('showsVerticalScrollIndicator={false}');
  });

  it('realigns the pager when the viewport width changes', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'onboarding.tsx'), 'utf8');

    expect(source).toContain('previousPageWidthRef');
    expect(source).toContain('scrollX.value = activeIndex * pageWidth');
  });
});
