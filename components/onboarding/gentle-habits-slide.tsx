import React from 'react';
import { Text, View } from 'react-native';

import { GentleHabitsIllustration } from '@/components/onboarding/gentle-habits-illustration';
import { gentleHabitsIntro } from '@/constants/onboarding';

export function GentleHabitsSlide() {
  return (
    <View className="flex-1 px-5 pt-4">
      <GentleHabitsIllustration activities={gentleHabitsIntro.activities} />
      <View className="mt-6">
        <Text className="font-sans text-[12px] font-bold tracking-[0.8px] text-label-slate">
          {gentleHabitsIntro.eyebrow.toUpperCase()}
        </Text>
        <Text className="mt-2 max-w-[344px] font-sans text-[32px] font-bold leading-[35px] tracking-[-0.8px] text-ink-navy">
          {gentleHabitsIntro.title}
        </Text>
        <Text className="mt-3 max-w-[344px] font-sans text-[16px] leading-6 text-soft-slate">
          {gentleHabitsIntro.body}
        </Text>
      </View>
    </View>
  );
}
