import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
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

export type HeightRulerHandle = {
  focus: () => void;
};

const heights = Array.from(
  { length: MAX_HEIGHT_CM - MIN_HEIGHT_CM + 1 },
  (_, index) => MIN_HEIGHT_CM + index,
);

export const HeightRuler = forwardRef<HeightRulerHandle, HeightRulerProps>(
  function HeightRuler({ value, onChange }, ref) {
    const containerRef = useRef<View>(null);
    const scrollRef = useRef<ScrollView>(null);
    const didInitializeRef = useRef(false);
    const initialValueRef = useRef(value);
    const lastEmittedValueRef = useRef(value);
    const [viewportWidth, setViewportWidth] = useState(0);
    const horizontalInset = Math.max(0, viewportWidth / 2 - HEIGHT_TICK_SPACING / 2);
    const contentStyle = useMemo(
      () => ({ paddingHorizontal: horizontalInset }),
      [horizontalInset],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus() {
          const reactTag = findNodeHandle(containerRef.current);
          if (reactTag !== null) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        },
      }),
      [],
    );

    useEffect(() => {
      if (!viewportWidth || didInitializeRef.current) {
        return;
      }

      didInitializeRef.current = true;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          animated: false,
          x: heightToOffset(initialValueRef.current),
        });
      });
    }, [viewportWidth]);

    const emitChange = (nextValue: number) => {
      if (nextValue === lastEmittedValueRef.current) {
        return;
      }

      lastEmittedValueRef.current = nextValue;
      onChange(nextValue);
    };

    const updateFromOffset = (
      event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
      emitChange(offsetToHeight(event.nativeEvent.contentOffset.x));
    };

    const setAccessibleValue = (nextValue: number) => {
      const clamped = clampHeight(nextValue);
      emitChange(clamped);
      scrollRef.current?.scrollTo({
        animated: true,
        x: heightToOffset(clamped),
      });
    };

    return (
      <View
        ref={containerRef}
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
  },
);
