import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SocialLoginButton } from '@/components/auth/social-login-button';
import { loginCopy } from '@/constants/auth';
import { signInWithProvider } from '@/lib/auth-oauth';
import type { SocialAuthProvider } from '@/types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [activeProvider, setActiveProvider] =
    useState<SocialAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  const openLegalUrl = async (url: string | undefined) => {
    if (!url) {
      showError(loginCopy.genericError);
      return;
    }

    await Linking.openURL(url);
  };

  const login = async (provider: SocialAuthProvider) => {
    setActiveProvider(provider);
    setErrorMessage(null);

    try {
      const result =
        provider === 'google'
          ? await signInWithProvider('google')
          : await signInWithProvider('facebook');

      if (result.status === 'success') {
        router.replace('/(tabs)');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      showError(
        /network|fetch|internet/i.test(message)
          ? loginCopy.offlineError
          : loginCopy.genericError,
      );
    } finally {
      setActiveProvider(null);
    }
  };

  const isBusy = activeProvider !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-[520px] flex-1 self-center px-5 pb-5 pt-4">
          <View
            className="absolute -right-16 top-36 h-48 w-48 rounded-full"
            style={{ backgroundColor: 'rgba(255, 214, 107, 0.3)' }}
          />
          <View
            className="absolute right-20 top-32 h-9 w-9 rounded-full"
            style={{ backgroundColor: 'rgba(169, 215, 245, 0.6)' }}
          />
          <View
            className="absolute right-20 top-72 h-24 w-24 rounded-full"
            style={{ backgroundColor: 'rgba(155, 203, 141, 0.3)' }}
          />

          <Text
            accessibilityLabel="AURALE"
            className="font-sans text-[15px] font-extrabold tracking-[2px] text-ink-navy">
            {loginCopy.brand}
          </Text>

          <View className="mt-24 max-w-[310px]">
            <Text className="font-rounded text-[32px] font-extrabold leading-[38px] tracking-[-0.7px] text-ink-navy">
              {loginCopy.title}
            </Text>
            <Text className="mt-4 font-sans text-[16px] leading-6 text-soft-slate">
              {loginCopy.body}
            </Text>
          </View>

          <View className="mt-auto gap-3 pt-12">
            <SocialLoginButton
              disabled={isBusy}
              label={activeProvider === 'google' ? loginCopy.loading : loginCopy.google}
              loading={activeProvider === 'google'}
              onPress={() => void login('google')}
              provider="google"
            />
            <SocialLoginButton
              disabled={isBusy}
              label={activeProvider === 'facebook' ? loginCopy.loading : loginCopy.facebook}
              loading={activeProvider === 'facebook'}
              onPress={() => void login('facebook')}
              provider="facebook"
            />

            {errorMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                className="text-center text-[14px] text-coral-notice"
                selectable>
                {errorMessage}
              </Text>
            ) : null}

            <Text className="px-3 text-center text-[12px] leading-[18px] text-soft-slate">
              {loginCopy.legalPrefix}
            </Text>
            <View className="flex-row flex-wrap items-center justify-center">
              <Pressable
                accessibilityLabel={loginCopy.terms}
                accessibilityRole="link"
                className="min-h-11 justify-center px-2"
                onPress={() => void openLegalUrl(process.env.EXPO_PUBLIC_TERMS_URL)}>
                <Text className="text-[12px] font-bold text-ink-navy underline">
                  {loginCopy.terms}
                </Text>
              </Pressable>
              <Text className="text-[12px] text-soft-slate">và</Text>
              <Pressable
                accessibilityLabel={loginCopy.privacy}
                accessibilityRole="link"
                className="min-h-11 justify-center px-2"
                onPress={() => void openLegalUrl(process.env.EXPO_PUBLIC_PRIVACY_URL)}>
                <Text className="text-[12px] font-bold text-ink-navy underline">
                  {loginCopy.privacy}
                </Text>
              </Pressable>
              <Text className="text-[12px] text-soft-slate">
                {loginCopy.legalEnd}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
