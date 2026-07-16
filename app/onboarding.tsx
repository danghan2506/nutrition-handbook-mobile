import React, { useEffect, useRef, useState } from 'react';
import {
  type FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { GentleHabitsSlide } from '@/components/onboarding/gentle-habits-slide';
import { MealTrackingSlide } from '@/components/onboarding/meal-tracking-slide';
import { OnboardingPagination } from '@/components/onboarding/onboarding-pagination';
import { VietnameseFoodAiSlide } from '@/components/onboarding/vietnamese-food-ai-slide';
import { mealTrackingIntro, vietnameseFoodAiIntro } from '@/constants/onboarding';
import {
  getNextSlideIndex,
  getSlideIndexFromOffset,
  ONBOARDING_SLIDE_COUNT,
} from '@/lib/onboarding-pager';
import { markOnboardingCompleted } from '@/lib/onboarding-storage';

const slides = [
  { key: 'meal-tracking', component: MealTrackingSlide },
  { key: 'gentle-habits', component: GentleHabitsSlide },
  { key: 'vietnamese-food-ai', component: VietnameseFoodAiSlide },
] as const;

type OnboardingSlide = (typeof slides)[number];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width: pageWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const completionPendingRef = useRef(false);
  const previousPageWidthRef = useRef(pageWidth);
  const scrollX = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const isLastSlide = activeIndex === ONBOARDING_SLIDE_COUNT - 1;
  const actionLabel = isLastSlide
    ? vietnameseFoodAiIntro.continueLabel
    : mealTrackingIntro.continueLabel;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    if (previousPageWidthRef.current === pageWidth) {
      return;
    }

    previousPageWidthRef.current = pageWidth;
    listRef.current?.scrollToIndex({ animated: false, index: activeIndex });
    scrollX.value = activeIndex * pageWidth;
  }, [activeIndex, pageWidth, scrollX]);

  const completeOnboarding = async () => {
    if (completionPendingRef.current) {
      return;
    }

    completionPendingRef.current = true;
    setIsCompleting(true);

    try {
      await markOnboardingCompleted();
    } catch (error: unknown) {
      console.warn('Không thể lưu trạng thái onboarding.', error);
    } finally {
      router.replace('/(tabs)');
    }
  };

  const advance = () => {
    if (isLastSlide) {
      void completeOnboarding();
      return;
    }

    const nextIndex = getNextSlideIndex(activeIndex);

    listRef.current?.scrollToIndex({
      animated: !reduceMotion,
      index: nextIndex,
    });

    if (reduceMotion) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View className="flex-1 pb-6 pt-2">
        <View className="flex-row items-center justify-between px-5">
          <Text className="font-sans text-[15px] font-extrabold tracking-[0.4px] text-ink-navy">
            AURALE
          </Text>
          <Pressable
            accessibilityLabel={mealTrackingIntro.skipLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: isCompleting }}
            className="min-h-11 min-w-11 items-center justify-center px-2"
            disabled={isCompleting}
            onPress={() => void completeOnboarding()}>
            <Text className="font-sans text-[15px] font-semibold text-soft-slate">
              {mealTrackingIntro.skipLabel}
            </Text>
          </Pressable>
        </View>

        <Animated.FlatList
          ref={listRef}
          className="flex-1"
          bounces={false}
          data={slides}
          getItemLayout={(_, index) => ({ index, length: pageWidth, offset: pageWidth * index })}
          horizontal
          keyExtractor={(item) => item.key}
          onMomentumScrollEnd={(event) => {
            setActiveIndex(getSlideIndexFromOffset(event.nativeEvent.contentOffset.x, pageWidth));
          }}
          onScroll={onScroll}
          pagingEnabled
          renderItem={({ item }) => {
            const SlideComponent = item.component;

            return (
              <View style={{ width: pageWidth }}>
                <SlideComponent />
              </View>
            );
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        />

        <View className="px-5 pt-5">
          <View className="mb-5 items-center">
            <OnboardingPagination
              activeIndex={activeIndex}
              pageWidth={pageWidth}
              scrollX={scrollX}
            />
          </View>
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: isCompleting }}
            className={`h-[54px] items-center justify-center rounded-[17px] bg-apricot shadow-sm ${
              isCompleting ? 'opacity-60' : ''
            }`}
            disabled={isCompleting}
            onPress={advance}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.98 : 1 }, { translateY: pressed ? 1 : 0 }],
            })}>
            <Animated.Text
              key={actionLabel}
              entering={reduceMotion ? undefined : FadeIn.duration(160)}
              exiting={reduceMotion ? undefined : FadeOut.duration(160)}
              className="font-sans text-[16px] font-bold text-surface">
              {actionLabel}
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
