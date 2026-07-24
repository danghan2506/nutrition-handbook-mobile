export type AccessDestination = '/onboarding' | '/login' | '/(tabs)';

type AccessState = {
  hasCompletedOnboarding: boolean;
  hasSession: boolean;
};

type VisibleAccessState = {
  destination: AccessDestination | null;
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

export function getVisibleAccessDestination({
  destination,
  hasSession,
}: VisibleAccessState): AccessDestination | null {
  if (hasSession) {
    return '/(tabs)';
  }

  if (destination === '/(tabs)') {
    return null;
  }

  return destination;
}
