import { Pressable, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealTrackingIllustration } from '@/components/onboarding/meal-tracking-illustration';
import { mealTrackingIntro } from '@/constants/onboarding';



export default function OnboardingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View className="flex-1 px-5 pb-6 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans text-[15px] font-extrabold tracking-[0.4px] text-ink-navy">AURALE</Text>
          <Text className="px-2 py-2 font-sans text-[15px] font-semibold text-soft-slate">
            {mealTrackingIntro.skipLabel}
          </Text>
        </View>

        <View className="mt-4">
          <MealTrackingIllustration meals={mealTrackingIntro.meals} />
        </View>

        <View className="mt-6">
          <Text className="font-sans text-[12px] font-bold tracking-[0.8px] text-label-slate">
            {mealTrackingIntro.eyebrow.toUpperCase()}
          </Text>
          <Text className="mt-2 max-w-[330px] font-sans text-[32px] font-bold leading-[35px] tracking-[-0.8px] text-ink-navy">
            {mealTrackingIntro.title}
          </Text>
          <Text className="mt-3 max-w-[330px] font-sans text-[16px] leading-[24px] text-soft-slate">
            {mealTrackingIntro.body}
          </Text>
        </View>

        <View className="mt-auto pt-6">
          <View accessibilityLabel="Màn 1 trên 3" className="mb-5 flex-row justify-center gap-2">
            <View className="h-2 w-6 rounded-full bg-apricot" />
            <View className="size-2 rounded-full bg-quiet-dot" />
            <View className="size-2 rounded-full bg-quiet-dot" />
          </View>
          <Pressable
            accessibilityLabel={mealTrackingIntro.continueLabel}
            accessibilityRole="button"
            className="h-[54px] items-center justify-center rounded-[17px] bg-apricot shadow-sm"
            onPress={() => router.push('/onboarding-habits')}>
            <Text className="font-sans text-[16px] font-bold text-surface">{mealTrackingIntro.continueLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
