import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'aurale.onboardingCompleted';

export async function readOnboardingCompleted(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)) === 'true';
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function getInitialRoute(): Promise<'/onboarding' | '/(tabs)'> {
  return (await readOnboardingCompleted()) ? '/(tabs)' : '/onboarding';
}
