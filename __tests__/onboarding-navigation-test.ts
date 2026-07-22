import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('onboarding navigation', () => {
  it('uses one swipeable pager and one shared completion flow', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'onboarding.tsx'), 'utf8');
    const layoutSource = readFileSync(join(process.cwd(), 'app', '_layout.tsx'), 'utf8');

    expect(source).toContain('Animated.FlatList');
    expect(source).toContain('pagingEnabled');
    expect(source).toContain('scrollToIndex');
    expect(source).toContain('setActiveIndex(nextIndex)');
    expect(source).not.toContain('if (reduceMotion)');
    expect(source).toContain('OnboardingPagination');
    expect(source).toContain('markOnboardingCompleted');
    expect(source).toContain("router.replace('/login')");
    expect(source).not.toContain("router.replace('/(tabs)')");
    expect(source).not.toContain('router.push');
    expect(source).not.toContain('/onboarding-habits');
    expect(source).toContain('accessibilityRole="button"');
    expect(layoutSource).not.toContain('onboarding-habits');
    expect(existsSync(join(process.cwd(), 'app', 'onboarding-habits.tsx'))).toBe(false);
  });
});