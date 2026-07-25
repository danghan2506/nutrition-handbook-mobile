import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  HEIGHT_TICK_SPACING,
  MAX_HEIGHT_CM,
  MIN_HEIGHT_CM,
} from '@/constants/profile';
import {
  clampHeight,
  heightToOffset,
  offsetToHeight,
} from '@/lib/profile-setup';

type HeightRulerProps = {
  value: number;
  onChange: (value: number) => void;
};

const heights = Array.from(
  { length: MAX_HEIGHT_CM - MIN_HEIGHT_CM + 1 },
  (_, index) => MIN_HEIGHT_CM + index,
);

export function HeightRuler({ value, onChange }: HeightRulerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const horizontalInset = Math.max(0, viewportWidth / 2 - HEIGHT_TICK_SPACING / 2);
  const contentStyle = useMemo(
    () => ({ paddingHorizontal: horizontalInset }),
    [horizontalInset],
  );

  useEffect(() => {
    if (!viewportWidth) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        animated: false,
        x: heightToOffset(value),
      });
    });
  }, [value, viewportWidth]);

  const updateFromOffset = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    onChange(offsetToHeight(event.nativeEvent.contentOffset.x));
  };

  const setAccessibleValue = (nextValue: number) => {
    const clamped = clampHeight(nextValue);
    onChange(clamped);
    scrollRef.current?.scrollTo({
      animated: true,
      x: heightToOffset(clamped),
    });
  };

  return (
    <View
      accessible
      accessibilityActions={[
        { name: 'increment', label: 'Tăng một centimet' },
        { name: 'decrement', label: 'Giảm một centimet' },
      ]}
      accessibilityLabel="Chiều cao"
      accessibilityRole="adjustable"
      accessibilityValue={{
        min: MIN_HEIGHT_CM,
        max: MAX_HEIGHT_CM,
        now: value,
        text: `${value} centimet`,
      }}
      className="relative border-y border-quiet-dot bg-surface"
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'increment') {
          setAccessibleValue(value + 1);
        }
        if (nativeEvent.actionName === 'decrement') {
          setAccessibleValue(value - 1);
        }
      }}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={contentStyle}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={updateFromOffset}
        onScroll={updateFromOffset}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={HEIGHT_TICK_SPACING}>
        {heights.map((height) => {
          const isMajor = height % 5 === 0;

          return (
            <View
              key={height}
              style={{ width: HEIGHT_TICK_SPACING }}
              className="items-center">
              <View
                className={`w-px bg-ink-navy ${
                  isMajor ? 'h-14' : 'h-8 opacity-40'
                }`}
              />
              {isMajor ? (
                <Text className="mt-2 text-[12px] font-bold text-label-slate">
                  {height}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <View
        pointerEvents="none"
        className="absolute bottom-6 left-1/2 top-3 w-[3px] -translate-x-1/2 rounded-full bg-apricot"
      />
    </View>
  );
}