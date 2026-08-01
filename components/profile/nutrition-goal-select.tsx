import {
  Dumbbell,
  Leaf,
  Scale,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  Text,
  View,
} from 'react-native';

import { NUTRITION_GOAL_OPTIONS } from '@/constants/profile';
import type { GoalType } from '@/types/profile';

type NutritionGoalSelectProps = {
  value: GoalType | null;
  disabled: boolean;
  error?: string;
  onChange: (value: GoalType) => void;
};

export type NutritionGoalSelectHandle = {
  focus: () => void;
};

const goalIcons = {
  HEALTHY_EATING: Leaf,
  WEIGHT_LOSS: TrendingDown,
  WEIGHT_MAINTENANCE: Scale,
  WEIGHT_GAIN: TrendingUp,
  MUSCLE_GAIN: Dumbbell,
} satisfies Record<GoalType, LucideIcon>;

export const NutritionGoalSelect = forwardRef<
  NutritionGoalSelectHandle,
  NutritionGoalSelectProps
>(function NutritionGoalSelect({ value, disabled, error, onChange }, ref) {
  const optionRefs = useRef<Partial<Record<GoalType, View | null>>>({});

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const target = value
          ? optionRefs.current[value]
          : optionRefs.current.HEALTHY_EATING;
        const reactTag = findNodeHandle(target ?? null);

        if (reactTag !== null) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      },
    }),
    [value],
  );

  return (
    <View accessibilityRole="radiogroup">
      {NUTRITION_GOAL_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = goalIcons[option.value];

        return (
          <Pressable
            key={option.value}
            ref={(node) => {
              optionRefs.current[option.value] = node;
            }}
            accessibilityLabel={`${option.label}. ${option.description}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            className={`mb-3 min-h-16 flex-row items-center rounded-[20px] border p-4 ${
              isSelected
                ? 'border-apricot bg-peach'
                : 'border-quiet-dot bg-surface'
            } ${disabled ? 'opacity-50' : ''}`}
            disabled={disabled}
            onPress={() => onChange(option.value)}>
            <Icon
              accessible={false}
              color={isSelected ? '#FF9E7A' : '#2F3542'}
              size={26}
              strokeWidth={2}
            />
            <View className="ml-3 flex-1">
              <Text className="text-[16px] font-extrabold text-ink-navy">
                {option.label}
              </Text>
              <Text className="mt-1 text-[14px] leading-5 text-ink-navy">
                {option.description}
              </Text>
            </View>
            <View
              accessibilityElementsHidden
              className={`ml-3 h-6 w-6 items-center justify-center rounded-full border-2 ${
                isSelected ? 'border-apricot bg-apricot' : 'border-quiet-dot'
              }`}>
              {isSelected ? (
                <Text className="text-[15px] font-extrabold text-ink-navy">✓</Text>
              ) : null}
            </View>
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
