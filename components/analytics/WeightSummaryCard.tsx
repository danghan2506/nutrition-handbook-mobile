import React from 'react';
import { View, Text } from 'react-native';

interface WeightSummaryCardProps {
  latestWeightKg: number;
  changeFromFirstKg: number;
  periodDays: number;
}

export const WeightSummaryCard: React.FC<WeightSummaryCardProps> = ({
  latestWeightKg,
  changeFromFirstKg,
  periodDays,
}) => {
  const isLoss = changeFromFirstKg <= 0;

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4 shadow-sm border border-[#F0EAE1]">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[#697386] font-medium text-sm">Tiến Trình Cân Nặng</Text>
        <View
          className={`px-2.5 py-1 rounded-full ${
            isLoss ? 'bg-[#EAF0ED]' : 'bg-[#FFF0E7]'
          }`}
        >
          <Text
            className={`font-semibold text-xs ${
              isLoss ? 'text-[#2F3542]' : 'text-[#FF9E7A]'
            }`}
          >
            {changeFromFirstKg > 0 ? `+${changeFromFirstKg}` : changeFromFirstKg} kg ({periodDays} ngày)
          </Text>
        </View>
      </View>

      <View className="flex-row items-baseline">
        <Text className="text-3xl font-bold text-[#2F3542]">{latestWeightKg}</Text>
        <Text className="text-base font-medium text-[#697386] ml-1">kg</Text>
      </View>
    </View>
  );
};
