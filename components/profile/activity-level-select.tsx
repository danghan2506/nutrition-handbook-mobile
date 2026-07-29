import { Image } from 'expo-image';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  Text,
  View,
} from 'react-native';

import { images } from '@/constants/images';
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
  sedentary: images.activitySedentary,
  light: images.activityLight,
  active: images.activityActive,
  very_active: images.activityVeryActive,
} satisfies Record<ActivityLevel, number>;

export const ActivityLevelSelect = forwardRef<
  ActivityLevelSelectHandle,
  ActivityLevelSelectProps
>(function ActivityLevelSelect({ value, disabled, error, onChange }, ref) {
  const optionRefs = useRef<Partial<Record<ActivityLevel, View | null>>>({});

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const target = value
          ? optionRefs.current[value]
          : optionRefs.current.sedentary;
        const reactTag = findNodeHandle(target ?? null);
        if (reactTag !== null) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      },
    }),
    [value],
  );

  return (
    <View>
      {ACTIVITY_LEVEL_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <View
            key={option.value}
            className={
              isSelected
                ? 'mb-3 rounded-[20px] border border-apricot bg-peach'
                : 'mb-3 rounded-[20px] border border-quiet-dot bg-surface'
            }>
            <Pressable
              ref={(node) => {
                optionRefs.current[option.value] = node;
              }}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{
                checked: isSelected,
                disabled,
                expanded: isSelected,
              }}
              className="min-h-14 p-4"
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
                    <Text className="text-[15px] font-extrabold text-ink-navy">
                      ✓
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>

            {isSelected ? (
              <View
                accessible
                accessibilityLabel={option.details.join('. ')}
                className="mx-4 mb-2 border-t border-apricot/40 pt-3">
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
          </View>
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
