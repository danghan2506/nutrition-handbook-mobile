import { type Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SocialLoginButton } from '@/components/auth/social-login-button';
import { Pressable, ScrollView, Text, TextInput, View } from '@/components/ui/tw';
import { AUTH_COPY } from '@/constants/auth';
import { requestPhoneOtp } from '@/lib/auth';
import {
  signInWithProvider,
  type SocialProvider,
} from '@/lib/auth-oauth';

type PendingAction = 'phone' | SocialProvider | null;

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isBusy = pendingAction !== null;

  const handlePhoneContinue = async () => {
    if (isBusy) {
      return;
    }

    setError(null);
    setPendingAction('phone');
    const result = await requestPhoneOtp(phone);
    setPendingAction(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push({
      pathname: '/(auth)/verify-otp',
      params: { phone: result.phone },
    } as unknown as Href);
  };

  const handleSocialContinue = async (provider: SocialProvider) => {
    if (isBusy) {
      return;
    }

    setError(null);
    setPendingAction(provider);
    const result = await signInWithProvider(provider);
    setPendingAction(null);

    if (result.status === 'success') {
      router.replace('/profile-setup');
      return;
    }

    if (result.status === 'configuration') {
      setError(AUTH_COPY.configurationError);
    } else if (result.status === 'error') {
      setError(AUTH_COPY.socialError);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerClassName="flex-grow px-5 pb-7 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mx-auto w-full max-w-[440px] flex-1">
            <Text className="min-h-11 py-3 font-sans text-[15px] font-extrabold tracking-[0.4px] text-ink-navy">
              {AUTH_COPY.brand}
            </Text>

            <View className="mt-10">
              <Text className="font-rounded text-[30px] font-extrabold leading-[37px] tracking-[-0.7px] text-ink-navy">
                {AUTH_COPY.loginTitle}
              </Text>
              <Text className="mt-3 max-w-[390px] font-sans text-[15px] leading-6 text-soft-slate">
                {AUTH_COPY.loginDescription}
              </Text>
            </View>

            <View className="mt-9">
              <Text className="mb-2 font-sans text-[14px] font-bold text-ink-navy">
                {AUTH_COPY.phoneLabel}
              </Text>
              <View className="h-[54px] flex-row items-center rounded-[17px] border border-[#E7DDD3] bg-surface px-4">
                <Text className="font-sans text-[16px] font-bold text-ink-navy">+84</Text>
                <View className="mx-3 h-6 w-px bg-[#E7DDD3]" />
                <TextInput
                  accessibilityLabel={AUTH_COPY.phoneLabel}
                  autoComplete="tel"
                  className="h-full flex-1 font-sans text-[16px] text-ink-navy"
                  editable={!isBusy}
                  keyboardType="phone-pad"
                  onChangeText={(value) => {
                    setPhone(value);
                    setError(null);
                  }}
                  onSubmitEditing={() => void handlePhoneContinue()}
                  placeholder={AUTH_COPY.phonePlaceholder}
                  placeholderTextColor="#9AA2AF"
                  returnKeyType="done"
                  textContentType="telephoneNumber"
                  value={phone}
                />
              </View>

              {error ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="mt-2 font-sans text-[13px] leading-5 text-terracotta">
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityLabel={AUTH_COPY.continue}
                accessibilityRole="button"
                accessibilityState={{ busy: pendingAction === 'phone', disabled: isBusy }}
                className={`mt-4 h-[54px] items-center justify-center rounded-[17px] bg-apricot ${
                  isBusy ? 'opacity-60' : ''
                }`}
                disabled={isBusy}
                onPress={() => void handlePhoneContinue()}>
                {pendingAction === 'phone' ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-sans text-[16px] font-bold text-surface">
                    {AUTH_COPY.continue}
                  </Text>
                )}
              </Pressable>
            </View>

            <View className="my-6 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-[#E7DDD3]" />
              <Text className="font-sans text-[13px] text-soft-slate">
                {AUTH_COPY.divider}
              </Text>
              <View className="h-px flex-1 bg-[#E7DDD3]" />
            </View>

            <View className="gap-3">
              <SocialLoginButton
                disabled={isBusy}
                isLoading={pendingAction === 'google'}
                label={AUTH_COPY.google}
                onPress={() => void handleSocialContinue('google')}
                provider="google"
              />
              <SocialLoginButton
                disabled={isBusy}
                isLoading={pendingAction === 'facebook'}
                label={AUTH_COPY.facebook}
                onPress={() => void handleSocialContinue('facebook')}
                provider="facebook"
              />
            </View>

            <Text className="mt-auto px-3 pt-8 text-center font-sans text-[12px] leading-[18px] text-soft-slate">
              {AUTH_COPY.legal}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
