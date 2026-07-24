import {
  getVisibleAccessDestination,
  resolveAccessDestination,
} from '../lib/access-routing';

describe('access routing', () => {
  it.each([
    [false, false, '/onboarding'],
    [false, true, '/(tabs)'],
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

  it('always exposes tabs for the current authenticated session', () => {
    expect(
      getVisibleAccessDestination({
        destination: '/login',
        hasSession: true,
      }),
    ).toBe('/(tabs)');
  });

  it('masks a stale authenticated destination as soon as the session is lost', () => {
    expect(
      getVisibleAccessDestination({
        destination: '/(tabs)',
        hasSession: false,
      }),
    ).toBeNull();
  });

  it('preserves a resolved unauthenticated destination', () => {
    expect(
      getVisibleAccessDestination({
        destination: '/login',
        hasSession: false,
      }),
    ).toBe('/login');
  });
});
