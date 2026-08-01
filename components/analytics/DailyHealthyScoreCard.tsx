import React from 'react';
import { View, Text } from 'react-native';
import { HealthyLevel } from '../../types/analytics';

interface DailyHealthyScoreCardProps {
  score: number;
  level: HealthyLevel;
  mealCount: number;
}

export const DailyHealthyScoreCard: React.FC<DailyHealthyScoreCardProps> = ({
  score,
  level,
  mealCount,
}) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'EXCELLENT':
        return { label: 'Xuất sắc', bg: 'bg-[#9BCB8D]', text: 'text-white' };
      case 'GOOD':
        return { label: 'Mức tốt', bg: 'bg-[#EAF0ED]', text: 'text-[#2F3542]' };
      case 'FAIR':
        return { label: 'Khá', bg: 'bg-[#FFD66B]/30', text: 'text-[#2F3542]' };
      case 'NEEDS_ATTENTION':
      default:
        return { label: 'Cần chú ý', bg: 'bg-[#FFF0E7]', text: 'text-[#FF8B78]' };
    }
  };

  const levelConfig = getLevelConfig();

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-3 shadow-sm border border-[#F0EAE1]">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[#697386] font-medium text-sm">Healthy Score Hôm Nay</Text>
        <View className={`px-3 py-1 rounded-full ${levelConfig.bg}`}>
          <Text className={`font-semibold text-xs ${levelConfig.text}`}>
            {levelConfig.label}
          </Text>
        </View>
      </View>

      <View className="flex-row items-baseline mb-2">
        <Text className="text-4xl font-bold text-[#2F3542] tracking-tight">{score}</Text>
        <Text className="text-lg font-medium text-[#697386] ml-1">/ 100</Text>
      </View>

      <Text className="text-xs text-[#697386]">
        Dựa trên {mealCount} bữa ăn đã ghi nhận trong ngày.
      </Text>
    </View>
  );
};
