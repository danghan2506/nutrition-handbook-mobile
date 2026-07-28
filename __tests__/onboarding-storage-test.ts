import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getInitialRoute,
  markOnboardingCompleted,
  readOnboardingCompleted,
} from '../lib/onboarding-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('onboarding storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to incomplete when no value exists', async () => {
    await expect(readOnboardingCompleted()).resolves.toBe(false);
    await expect(getInitialRoute(false)).resolves.toBe('/onboarding');
    await expect(getInitialRoute(true)).resolves.toBe('/onboarding');
  });

  it('stores completion and opens login without a session', async () => {
    await markOnboardingCompleted();

    await expect(readOnboardingCompleted()).resolves.toBe(true);
    await expect(getInitialRoute(false)).resolves.toBe('/(auth)/login');
  });

  it('opens the main tabs only with completed onboarding and a session', async () => {
    await markOnboardingCompleted();

    await expect(getInitialRoute(true)).resolves.toBe('/(tabs)');
  });

  it('treats every value except true as incomplete', async () => {
    await AsyncStorage.setItem('aurale.onboardingCompleted', 'false');

    await expect(readOnboardingCompleted()).resolves.toBe(false);
  });
});
