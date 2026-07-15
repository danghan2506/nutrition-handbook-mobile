import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GentleHabitsIllustration } from '@/components/onboarding/gentle-habits-illustration';
import { gentleHabitsIntro } from '@/constants/onboarding';

export default function OnboardingHabitsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View className="flex-1 px-5 pb-6 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans text-[15px] font-extrabold tracking-[0.4px] text-ink-navy">AURALE</Text>
          <Text className="px-2 py-2 font-sans text-[15px] font-semibold text-soft-slate">
            {gentleHabitsIntro.skipLabel}
          </Text>
        </View>

        <View className="mt-4">
          <GentleHabitsIllustration activities={gentleHabitsIntro.activities} />
        </View>

        <View className="mt-6">
          <Text className="font-sans text-[12px] font-bold tracking-[0.8px] text-label-slate">
            {gentleHabitsIntro.eyebrow.toUpperCase()}
          </Text>
          <Text className="mt-2 max-w-[340px] font-sans text-[32px] font-bold leading-[35px] tracking-[-0.8px] text-ink-navy">
            {gentleHabitsIntro.title}
          </Text>
          <Text className="mt-3 max-w-[344px] font-sans text-[16px] leading-6 text-soft-slate">
            {gentleHabitsIntro.body}
          </Text>
        </View>

        <View className="mt-auto pt-6">
          <View accessibilityLabel="Màn 2 trên 3" className="mb-5 flex-row justify-center gap-2">
            <View className="size-2 rounded-full bg-quiet-dot" />
            <View className="h-2 w-6 rounded-full bg-apricot" />
            <View className="size-2 rounded-full bg-quiet-dot" />
          </View>
          <View className="h-[54px] items-center justify-center rounded-[17px] bg-apricot shadow-sm">
            <Text className="font-sans text-[16px] font-bold text-surface">
              {gentleHabitsIntro.continueLabel}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}