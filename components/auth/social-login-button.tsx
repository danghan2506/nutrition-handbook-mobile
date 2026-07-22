import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { SocialAuthProvider } from '@/types/auth';

type SocialLoginButtonProps = {
  disabled: boolean;
  label: string;
  loading: boolean;
  onPress: () => void;
  provider: SocialAuthProvider;
};

const providerColor: Record<SocialAuthProvider, string> = {
  google: '#4285F4',
  facebook: '#1877F2',
};

export function SocialLoginButton({
  disabled,
  label,
  loading,
  onPress,
  provider,
}: SocialLoginButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      className={`min-h-[54px] flex-row items-center rounded-[17px] border border-quiet-dot bg-surface px-3 ${
        disabled ? 'opacity-60' : ''
      }`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [
          { scale: pressed && !reduceMotion ? 0.98 : 1 },
          { translateY: pressed && !reduceMotion ? 1 : 0 },
        ],
      })}>
      <View className="w-9 items-start">
        <FontAwesome
          color={providerColor[provider]}
          name={provider}
          size={22}
        />
      </View>
      <Text className="flex-1 text-center font-sans text-[15px] font-bold text-ink-navy">
        {label}
      </Text>
      <View className="w-9 items-end">
        {loading ? (
          <ActivityIndicator color="#697386" size="small" />
        ) : (
          <FontAwesome color="#A69D94" name="angle-right" size={18} />
        )}
      </View>
    </Pressable>
  );
}
