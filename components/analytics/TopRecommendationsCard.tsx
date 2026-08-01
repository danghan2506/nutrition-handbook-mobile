import React from 'react';
import { View, Text } from 'react-native';
import { DailyAssessmentData } from '../../types/analytics';

interface TopRecommendationsCardProps {
  recommendations: DailyAssessmentData['recommendations'];
}

export const TopRecommendationsCard: React.FC<TopRecommendationsCardProps> = ({
  recommendations,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <View className="bg-[#FFF0E7] rounded-2xl p-5 mx-4 mb-3 border border-[#FF9E7A]/30">
      <View className="flex-row items-center mb-3">
        <Text className="text-[#2F3542] font-bold text-base">Khuyến Nghị Cá Nhân Hóa</Text>
      </View>

      {recommendations.map((rec, idx) => (
        <View key={idx} className="flex-row items-start mb-2 last:mb-0">
          <View className="mt-1 mr-2 bg-[#FF9E7A] px-2 py-0.5 rounded-md">
            <Text className="text-[10px] font-bold text-white uppercase">
              {rec.priority === 'HIGH' ? 'Ưu tiên cao' : 'Gợi ý'}
            </Text>
          </View>
          <Text className="flex-1 text-sm text-[#2F3542] leading-5">
            {rec.templateText}
          </Text>
        </View>
      ))}
    </View>
  );
};
