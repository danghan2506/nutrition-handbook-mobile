import React from 'react';
import { Text, View } from 'react-native';

import { VietnameseFoodAiIllustration } from '@/components/onboarding/vietnamese-food-ai-illustration';
import { vietnameseFoodAiIntro } from '@/constants/onboarding';

export function VietnameseFoodAiSlide() {
  return (
    <View className="flex-1 px-5 pt-4">
      <VietnameseFoodAiIllustration
        lookupLabel={vietnameseFoodAiIntro.lookupLabel}
        metrics={vietnameseFoodAiIntro.metrics}
      />
      <View className="mt-6">
        <Text className="font-sans text-[12px] font-bold tracking-[0.8px] text-label-slate">
          {vietnameseFoodAiIntro.eyebrow.toUpperCase()}
        </Text>
        <Text className="mt-2 max-w-[344px] font-sans text-[32px] font-bold leading-[35px] tracking-[-0.8px] text-ink-navy">
          {vietnameseFoodAiIntro.title}
        </Text>
        <Text className="mt-3 max-w-[344px] font-sans text-[16px] leading-6 text-soft-slate">
          {vietnameseFoodAiIntro.body}
        </Text>
      </View>
    </View>
  );
}
