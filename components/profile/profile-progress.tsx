import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { PROFILE_STEP_COUNT, profileCopy } from '@/constants/profile';
import type { ProfileStep } from '@/types/profile';

type ProfileProgressProps = {
  disabled: boolean;
  step: ProfileStep;
  onBack: () => void;
};

export function ProfileProgress({ disabled, step, onBack }: ProfileProgressProps) {
  return (
    <>
      <View className="mb-6 flex-row items-center justify-between">
        {step > 0 ? (
          <Pressable
            accessibilityLabel={profileCopy.back}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            className="size-11 items-center justify-center rounded-[14px] border border-quiet-dot bg-surface"
            disabled={disabled}
            onPress={onBack}>
            <Text className="text-[25px] leading-7 text-ink-navy">‹</Text>
          </Pressable>
        ) : (
          <View className="size-11" />
        )}
        <Text className="text-[13px] font-bold text-label-slate">
          {step + 1} / {PROFILE_STEP_COUNT}
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Màn ${step + 1} trên ${PROFILE_STEP_COUNT}`}
        className="mb-8 flex-row gap-2">
        {Array.from({ length: PROFILE_STEP_COUNT }, (_, index) => (
          <View
            key={index}
            className={`h-[5px] flex-1 rounded-full ${
              index <= step ? 'bg-apricot' : 'bg-quiet-dot'
            }`}
          />
        ))}
      </View>
    </>
  );
}
