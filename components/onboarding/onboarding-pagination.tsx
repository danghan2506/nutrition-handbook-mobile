import React from 'react';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { ONBOARDING_SLIDE_COUNT } from '@/lib/onboarding-pager';

type OnboardingPaginationProps = {
  activeIndex: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
};

const DOT_SLOT_WIDTH = 24;

export function OnboardingPagination({
  activeIndex,
  pageWidth,
  scrollX,
}: OnboardingPaginationProps) {
  const indicatorStyle = useAnimatedStyle(() => {
    const pageProgress = pageWidth > 0 ? scrollX.value / pageWidth : 0;

    return {
      transform: [
        {
          translateX: interpolate(
            pageProgress,
            [0, ONBOARDING_SLIDE_COUNT - 1],
            [0, DOT_SLOT_WIDTH * (ONBOARDING_SLIDE_COUNT - 1)],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  }, [pageWidth]);

  return (
    <View
      accessible
      accessibilityLabel={`Màn ${activeIndex + 1} trên 3`}
      className="relative flex-row">
      {Array.from({ length: ONBOARDING_SLIDE_COUNT }, (_, index) => (
        <View key={index} className="h-2 w-6 items-center justify-center">
          <View className="size-2 rounded-full bg-quiet-dot" />
        </View>
      ))}
      <Animated.View
        className="absolute left-0 top-0 h-2 w-6 rounded-full bg-apricot"
        style={indicatorStyle}
      />
    </View>
  );
}
