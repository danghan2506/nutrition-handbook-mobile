import { Text, View } from 'react-native';
import React from 'react';

type MealTint = 'bg-peach' | 'bg-butter-wash' | 'bg-leaf-wash';

type MealTrackingIllustrationProps = {
  meals: readonly string[];
};

const mealTints: readonly MealTint[] = ['bg-peach', 'bg-butter-wash', 'bg-leaf-wash'];

function BowlIcon({ tint }: { tint: MealTint }) {
  return (
    <View className={`size-[54px] items-center justify-center rounded-full ${tint}`}>
      <View className="relative mt-2 h-[17px] w-[34px] rounded-b-[20px] border-x-2 border-b-2 border-ink-navy bg-surface">
        <View className="absolute -left-[3px] -top-[3px] h-[3px] w-[36px] rounded-full bg-ink-navy" />
        <View className="absolute -top-[15px] left-[6px] h-[11px] w-[4px] rounded-full bg-apricot" />
        <View className="absolute -top-[19px] left-[17px] h-[11px] w-[4px] rounded-full bg-butter" />
        <View className="absolute -top-[13px] left-[28px] h-[11px] w-[4px] rounded-full bg-leaf" />
      </View>
    </View>
  );
}

export function MealTrackingIllustration({ meals }: MealTrackingIllustrationProps) {
  return (
    <View
      accessible
      accessibilityLabel="Minh hoạ ba bữa ăn: sáng, trưa và tối"
      accessibilityRole="image"
      className="relative h-[302px] overflow-hidden rounded-[28px] bg-peach px-5 pb-7 pt-8">
      <View className="absolute right-7 top-7 size-[136px] rounded-full bg-sunrise-wash opacity-75" />
      <View className="absolute left-7 top-14 h-[38px] w-[124px] rounded-full bg-surface opacity-75" />
      <View className="absolute left-14 top-9 size-[58px] rounded-full bg-surface opacity-75" />

      <View className="mt-auto flex-row gap-3">
        {meals.map((meal, index) => (
          <View key={meal} className="flex-1 items-center rounded-[22px] bg-surface px-2 py-3 shadow-sm">
            <BowlIcon tint={mealTints[index] ?? 'bg-peach'} />
            <Text className="mt-2 font-sans text-[13px] font-semibold text-ink-navy">{meal}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
