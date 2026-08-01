import React from 'react';
import { View, Text } from 'react-native';
import { DailyAssessmentData } from '../../types/analytics';

interface TopRecommendationsCardProps {
  recommendations: DailyAssessmentData['recommendations'] | null | undefined;
}

export const TopRecommendationsCard: React.FC<TopRecommendationsCardProps> = ({
  recommendations,
}) => {
  const usableRecommendations = (recommendations ?? [])
    .map((recommendation) => ({
      ...recommendation,
      displayText:
        typeof recommendation.llmText === 'string' && recommendation.llmText.trim().length > 0
          ? recommendation.llmText.trim()
          : recommendation.templateText.trim(),
    }))
    .filter((recommendation) => recommendation.displayText.length > 0);

  return (
    <View className="bg-[#FFF0E7] rounded-2xl p-5 mx-4 mb-3 border border-[#FF9E7A]/30">
      <View className="flex-row items-center mb-3">
        <Text className="text-[#2F3542] font-bold text-base">Khuyến Nghị Cá Nhân Hóa</Text>
      </View>

      {usableRecommendations.length === 0 ? (
        <Text className="text-sm text-[#697386]">Chưa có khuyến nghị cho khoảng thời gian này.</Text>
      ) : (
        usableRecommendations.map((recommendation, index) => (
          <View key={recommendation.recommendationCode + '-' + index} className="flex-row items-start mb-2 last:mb-0">
            <View className="mt-1 mr-2 bg-[#FF9E7A] px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-white uppercase">
                {recommendation.priority === 'HIGH' ? 'Ưu tiên cao' : 'Gợi ý'}
              </Text>
            </View>
            <Text className="flex-1 text-sm text-[#2F3542] leading-5">
              {recommendation.displayText}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};