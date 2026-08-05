import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OtpInput } from '@/components/auth/otp-input';
import { Pressable, ScrollView, Text, View } from '@/components/ui/tw';
import { AUTH_COPY, OTP_LENGTH, RESEND_SECONDS } from '@/constants/auth';
import { requestPhoneOtp, verifyPhoneOtp } from '@/lib/auth';
import { maskVietnamesePhone, normalizeVietnamesePhone } from '@/lib/phone-number';

type PendingAction = 'verify' | 'resend' | null;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string | string[] }>();
  const rawPhone = Array.isArray(params.phone) ? params.phone[0] : params.phone;
  const phone = normalizeVietnamesePhone(rawPhone ?? '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isBusy = pendingAction !== null;
  const canVerify = otp.length === OTP_LENGTH && !isBusy && Boolean(phone);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countdown]);

  const handleVerify = async () => {
    if (!canVerify || !phone) {
      return;
    }

    setError(null);
    setPendingAction('verify');
    const result = await verifyPhoneOtp(phone, otp);
    setPendingAction(null);

    if (!result.ok) {
      setError(
        result.reason === 'not_configured'
          ? AUTH_COPY.configurationError
          : AUTH_COPY.otpError,
      );
      return;
    }

    router.replace('/profile-setup');
  };

  const handleResend = async () => {
    if (!phone || countdown > 0 || isBusy) {
      return;
    }

    setError(null);
    setPendingAction('resend');
    const result = await requestPhoneOtp(phone);
    setPendingAction(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setOtp('');
    setCountdown(RESEND_SECONDS);
  };

  const resendLabel =
    countdown > 0
      ? `Gửi lại mã sau 00:${String(countdown).padStart(2, '0')}`
      : AUTH_COPY.resend;

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
            <View className="flex-row items-center">
              <Pressable
                accessibilityLabel="Quay lại"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center"
                onPress={() => router.back()}>
                <Feather color="#2F3542" name="arrow-left" size={22} />
              </Pressable>
              <Text className="font-sans text-[15px] font-extrabold tracking-[0.4px] text-ink-navy">
                {AUTH_COPY.brand}
              </Text>
            </View>

            <View className="mt-12">
              <Text className="font-rounded text-[30px] font-extrabold leading-[37px] tracking-[-0.7px] text-ink-navy">
                {AUTH_COPY.otpTitle}
              </Text>
              <Text className="mt-3 max-w-[390px] font-sans text-[15px] leading-6 text-soft-slate">
                {AUTH_COPY.otpDescription(
                  phone ? maskVietnamesePhone(phone) : '+84 *** *** ***',
                )}
              </Text>
            </View>

            <View className="mt-9">
              <OtpInput
                disabled={isBusy}
                hasError={Boolean(error)}
                onChange={(value) => {
                  setOtp(value);
                  setError(null);
                }}
                value={otp}
              />

              {error ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="mt-3 font-sans text-[13px] leading-5 text-terracotta">
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityLabel={AUTH_COPY.verify}
                accessibilityRole="button"
                accessibilityState={{ busy: pendingAction === 'verify', disabled: !canVerify }}
                className={`mt-7 h-[54px] items-center justify-center rounded-[17px] bg-apricot ${
                  canVerify ? '' : 'opacity-50'
                }`}
                disabled={!canVerify}
                onPress={() => void handleVerify()}>
                {pendingAction === 'verify' ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-sans text-[16px] font-bold text-surface">
                    {AUTH_COPY.verify}
                  </Text>
                )}
              </Pressable>

              <View className="mt-7 items-center">
                <Pressable
                  accessibilityLabel={resendLabel}
                  accessibilityRole="button"
                  accessibilityState={{
                    busy: pendingAction === 'resend',
                    disabled: countdown > 0 || isBusy,
                  }}
                  className="min-h-11 items-center justify-center px-4"
                  disabled={countdown > 0 || isBusy}
                  onPress={() => void handleResend()}>
                  <Text
                    className={`font-sans text-[14px] font-semibold ${
                      countdown > 0 ? 'text-soft-slate' : 'text-terracotta'
                    }`}>
                    {pendingAction === 'resend' ? 'Đang thử lại…' : resendLabel}
                  </Text>
                </Pressable>
                <Text className="mt-6 font-sans text-[13px] text-soft-slate">
                  {AUTH_COPY.otpPrivacy}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
