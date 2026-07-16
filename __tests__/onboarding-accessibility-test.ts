import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const illustrationFiles = [
  'meal-tracking-illustration.tsx',
  'gentle-habits-illustration.tsx',
  'vietnamese-food-ai-illustration.tsx',
] as const;

describe('onboarding illustration accessibility', () => {
  it.each(illustrationFiles)('%s exposes a focusable image description', (fileName) => {
    const source = readFileSync(
      join(process.cwd(), 'components', 'onboarding', fileName),
      'utf8',
    );

    expect(source).toContain('accessible');
    expect(source).toContain('accessibilityLabel=');
    expect(source).toContain('accessibilityRole="image"');
  });
});
