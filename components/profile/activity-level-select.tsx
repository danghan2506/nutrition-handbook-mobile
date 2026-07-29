import { Image } from 'expo-image';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  Text,
  View,
} from 'react-native';

import { ACTIVITY_LEVEL_OPTIONS } from '@/constants/profile';
import type { ActivityLevel } from '@/types/profile';

type ActivityLevelSelectProps = {
  value: ActivityLevel | null;
  disabled: boolean;
  error?: string;
  onChange: (value: ActivityLevel) => void;
};

export type ActivityLevelSelectHandle = {
  focus: () => void;
};

const activityIcons = {
  sedentary: require('../../assets/icons/airline_seat_recline_normal.svg'),
  light: require('../../assets/icons/directions_walk.svg'),
  active: require('../../assets/icons/sports_gymnastics.svg'),
  very_active: require('../../assets/icons/directions_run.svg'),
} satisfies Record<ActivityLevel, number>;

export const ActivityLevelSelect = forwardRef<
  ActivityLevelSelectHandle,
  ActivityLevelSelectProps
>(function ActivityLevelSelect({ value, disabled, error, onChange }, ref) {
  const firstOptionRef = useRef<View>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const reactTag = findNodeHandle(firstOptionRef.current);
        if (reactTag !== null) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      },
    }),
    [],
  );

  return (
    <View>
      {ACTIVITY_LEVEL_OPTIONS.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            ref={index === 0 ? firstOptionRef : undefined}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            className={`mb-3 min-h-14 rounded-[20px] border p-4 ${
              isSelected
                ? 'border-apricot bg-peach'
                : 'border-quiet-dot bg-surface'
            }`}
            disabled={disabled}
            onPress={() => onChange(option.value)}>
            <View className="flex-row items-center">
              <Image
                accessible={false}
                contentFit="contain"
                source={activityIcons[option.value]}
                style={{ height: 28, width: 28 }}
                tintColor={isSelected ? '#FF9E7A' : '#2F3542'}
              />
              <Text className="ml-3 flex-1 text-[16px] font-extrabold text-ink-navy">
                {option.label}
              </Text>
              <View
                accessibilityElementsHidden
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? 'border-apricot bg-apricot'
                    : 'border-quiet-dot'
                }`}>
                {isSelected ? (
                  <Text className="text-[15px] font-extrabold text-surface">
                    ✓
                  </Text>
                ) : null}
              </View>
            </View>

            {isSelected ? (
              <View className="mt-4 border-t border-apricot/40 pt-3">
                {option.details.map((detail) => (
                  <View key={detail} className="mb-2 flex-row">
                    <Text className="mr-2 text-[14px] leading-5 text-ink-navy">
                      •
                    </Text>
                    <Text className="flex-1 text-[14px] leading-5 text-ink-navy">
                      {detail}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        );
      })}

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-1 text-[13px] text-coral-notice">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
