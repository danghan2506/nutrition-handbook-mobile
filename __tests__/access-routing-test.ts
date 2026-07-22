import { resolveAccessDestination } from '../lib/access-routing';

describe('access routing', () => {
  it.each([
    [false, false, '/onboarding'],
    [false, true, '/onboarding'],
    [true, false, '/login'],
    [true, true, '/(tabs)'],
  ] as const)(
    'routes onboarding=%s session=%s to %s',
    (hasCompletedOnboarding, hasSession, expected) => {
      expect(
        resolveAccessDestination({ hasCompletedOnboarding, hasSession }),
      ).toBe(expected);
    },
  );
});
