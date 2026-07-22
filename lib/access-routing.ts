export type AccessDestination = '/onboarding' | '/login' | '/(tabs)';

type AccessState = {
  hasCompletedOnboarding: boolean;
  hasSession: boolean;
};

export function resolveAccessDestination({
  hasCompletedOnboarding,
  hasSession,
}: AccessState): AccessDestination {
  if (!hasCompletedOnboarding) {
    return '/onboarding';
  }

  return hasSession ? '/(tabs)' : '/login';
}
