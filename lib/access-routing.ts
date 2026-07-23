export type AccessDestination = '/onboarding' | '/login' | '/(tabs)';

type AccessState = {
  hasCompletedOnboarding: boolean;
  hasSession: boolean;
};

export function resolveAccessDestination({
  hasCompletedOnboarding,
  hasSession,
}: AccessState): AccessDestination {
  if (hasSession) {
    return '/(tabs)';
  }

  if (!hasCompletedOnboarding) {
    return '/onboarding';
  }

  return '/login';
}
