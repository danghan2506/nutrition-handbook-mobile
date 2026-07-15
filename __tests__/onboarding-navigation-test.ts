import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('onboarding navigation', () => {
  it('moves from meal tracking to gentle habits when Continue is pressed', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'onboarding.tsx'), 'utf8');

    expect(source).toContain("router.push('/onboarding-habits')");
    expect(source).toContain('accessibilityRole="button"');
  });
});
