import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { SocialAuthProvider } from '@/types/auth';

type SocialLoginButtonProps = {
  disabled: boolean;
  label: string;
  loading: boolean;
  onPress: () => void;
  provider: SocialAuthProvider;
};

function GoogleLogo() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.305 2.982-7.35Z"
        fill="#4285F4"
      />
      <Path
        d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.596-4.123h-3.34v2.591A9.999 9.999 0 0 0 12 22Z"
        fill="#34A853"
      />
      <Path
        d="M6.404 13.9A6.019 6.019 0 0 1 6.091 12c0-.659.113-1.3.313-1.9V7.509h-3.34A9.999 9.999 0 0 0 2 12c0 1.614.386 3.141 1.064 4.491L6.404 13.9Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.991 14.695 2 12 2a9.999 9.999 0 0 0-8.936 5.509l3.34 2.591C7.191 7.736 9.395 5.977 12 5.977Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

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
      <View
        accessibilityElementsHidden
        className="w-9 items-start"
        importantForAccessibility="no-hide-descendants">
        {provider === 'google' ? (
          <GoogleLogo />
        ) : (
          <FontAwesome color="#1877F2" name="facebook" size={22} />
        )}
      </View>
      <Text className="flex-1 text-center font-sans text-[15px] font-bold text-ink-navy">
        {label}
      </Text>
      <View
        accessibilityElementsHidden
        className="w-9 items-end"
        importantForAccessibility="no-hide-descendants">
        {loading ? (
          <ActivityIndicator color="#697386" size="small" />
        ) : (
          <FontAwesome color="#A69D94" name="angle-right" size={18} />
        )}
      </View>
    </Pressable>
  );
}
