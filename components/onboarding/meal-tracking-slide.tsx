import React from 'react';
import { Text, View } from 'react-native';

import { MealTrackingIllustration } from '@/components/onboarding/meal-tracking-illustration';
import { mealTrackingIntro } from '@/constants/onboarding';

export function MealTrackingSlide() {
  return (
    <View className="flex-1 px-5 pt-4">
      <MealTrackingIllustration meals={mealTrackingIntro.meals} />
      <View className="mt-6">
        <Text className="font-sans text-[12px] font-bold tracking-[0.8px] text-label-slate">
          {mealTrackingIntro.eyebrow.toUpperCase()}
        </Text>
        <Text className="mt-2 max-w-[344px] font-sans text-[32px] font-bold leading-[35px] tracking-[-0.8px] text-ink-navy">
          {mealTrackingIntro.title}
        </Text>
        <Text className="mt-3 max-w-[344px] font-sans text-[16px] leading-6 text-soft-slate">
          {mealTrackingIntro.body}
        </Text>
      </View>
    </View>
  );
}
