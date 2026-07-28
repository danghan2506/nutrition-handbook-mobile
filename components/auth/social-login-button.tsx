import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { Pressable, Text, View } from '@/components/ui/tw';
import type { SocialProvider } from '@/lib/auth-oauth';

type SocialLoginButtonProps = {
  disabled: boolean;
  isLoading: boolean;
  label: string;
  onPress: () => void;
  provider: SocialProvider;
};

export function SocialLoginButton({
  disabled,
  isLoading,
  label,
  onPress,
  provider,
}: SocialLoginButtonProps) {
  const iconName = provider === 'google' ? 'google' : 'facebook';
  const iconColor = provider === 'google' ? '#DB4437' : '#1877F2';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled }}
      className={`h-[54px] flex-row items-center justify-center rounded-[17px] border border-[#E7DDD3] bg-surface px-5 ${
        disabled ? 'opacity-60' : ''
      }`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.78 : 1 })}>
      <View className="absolute left-5 h-8 w-8 items-center justify-center">
        {isLoading ? (
          <ActivityIndicator color="#697386" size="small" />
        ) : (
          <FontAwesome color={iconColor} name={iconName} size={20} />
        )}
      </View>
      <Text className="font-sans text-[15px] font-bold text-ink-navy">
        {label}
      </Text>
    </Pressable>
  );
}
