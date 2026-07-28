import React, { useRef, useState } from 'react';
import type { TextInput as NativeTextInput } from 'react-native';

import { OTP_LENGTH } from '@/constants/auth';
import { sanitizeOtp } from '@/lib/phone-number';
import { Pressable, Text, TextInput, View } from '@/components/ui/tw';

type OtpInputProps = {
  disabled?: boolean;
  hasError?: boolean;
  onChange: (value: string) => void;
  value: string;
};

export function OtpInput({
  disabled = false,
  hasError = false,
  onChange,
  value,
}: OtpInputProps) {
  const inputRef = useRef<NativeTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="none"
      className="relative"
      onPress={() => inputRef.current?.focus()}>
      <View className="flex-row gap-2">
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = value[index] ?? '';
          const isActive = isFocused && index === Math.min(value.length, 5);
          const borderClass = hasError
            ? 'border-[#C97B5B]'
            : isActive
              ? 'border-apricot border-2'
              : 'border-[#E7DDD3]';

          return (
            <View
              className={`h-[54px] min-w-0 flex-1 items-center justify-center rounded-[15px] border bg-surface ${borderClass}`}
              key={index}>
              <Text className="font-sans text-[21px] font-bold text-ink-navy">
                {digit}
              </Text>
              {isActive && !digit ? (
                <View className="absolute h-5 w-[2px] rounded-full bg-ink-navy" />
              ) : null}
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        accessibilityLabel="Mã xác thực gồm 6 chữ số"
        autoComplete="sms-otp"
        autoFocus
        caretHidden
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        onBlur={() => setIsFocused(false)}
        onChangeText={(nextValue) => onChange(sanitizeOtp(nextValue))}
        onFocus={() => setIsFocused(true)}
        style={{ bottom: 0, left: 0, opacity: 0.01, position: 'absolute', right: 0, top: 0 }}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}
