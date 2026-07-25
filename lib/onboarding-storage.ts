import AsyncStorage from '@react-native-async-storage/async-storage';

import { resolveAccessDestination } from '@/lib/access-routing';

const ONBOARDING_COMPLETED_KEY = 'aurale.onboardingCompleted';

export async function readOnboardingCompleted(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)) === 'true';
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function getInitialRoute(
  hasSession: boolean,
): Promise<'/onboarding' | '/login' | '/(tabs)'> {
  if (hasSession) {
    return '/(tabs)';
  }

  return resolveAccessDestination({
    hasCompletedOnboarding: await readOnboardingCompleted(),
    hasSession: false,
  });
}
