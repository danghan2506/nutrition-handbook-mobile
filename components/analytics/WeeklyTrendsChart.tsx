import React from 'react';
import { View, Text } from 'react-native';
import { TrendPoint } from '../../types/analytics';

interface WeeklyTrendsChartProps {
  points: TrendPoint[];
}

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({ points }) => {
  const maxCalories = 2200;

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-3 shadow-sm border border-[#F0EAE1]">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#2F3542] font-semibold text-base">Xu Hướng 7 Ngày Qua</Text>
        <Text className="text-xs text-[#697386]">Calo & Score</Text>
      </View>

      <View className="flex-row justify-between items-end h-40 pt-4 px-1">
        {points.map((pt, idx) => {
          const heightPercent = Math.min(Math.max((pt.caloriesKcal / maxCalories) * 100, 15), 100);
          return (
            <View key={idx} className="items-center flex-1">
              <Text className="text-[10px] font-semibold text-[#FF9E7A] mb-1">
                {pt.healthyScore}
              </Text>
              <View className="w-full px-1 items-center justify-end h-28">
                <View
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[24px] bg-[#A9D7F5] rounded-t-lg"
                />
              </View>
              <Text className="text-xs text-[#697386] font-medium mt-2">{pt.dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
