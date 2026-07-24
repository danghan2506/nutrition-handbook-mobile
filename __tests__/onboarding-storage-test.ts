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
  });

  it('opens login after onboarding when no session exists', async () => {
    await markOnboardingCompleted();

    await expect(readOnboardingCompleted()).resolves.toBe(true);
    await expect(getInitialRoute(false)).resolves.toBe('/login');
  });

  it('opens the main tabs after onboarding when a session exists', async () => {
    await markOnboardingCompleted();

    await expect(getInitialRoute(true)).resolves.toBe('/(tabs)');
  });

  it('treats every value except true as incomplete', async () => {
    await AsyncStorage.setItem('aurale.onboardingCompleted', 'false');

    await expect(readOnboardingCompleted()).resolves.toBe(false);
  });

  it('does not read onboarding storage for an authenticated user', async () => {
    const readSpy = jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('storage unavailable'));

    readSpy.mockClear();

    await expect(getInitialRoute(true)).resolves.toBe('/(tabs)');
    expect(readSpy).not.toHaveBeenCalled();

    readSpy.mockRestore();
  });
});
