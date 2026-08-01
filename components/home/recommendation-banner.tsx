import { Text, View } from 'react-native';

import type { DashboardRecommendation } from '@/types/dashboard';

export function RecommendationBanner({
  recommendation,
}: {
  recommendation?: DashboardRecommendation;
}) {
  if (!recommendation) return null;

  return (
    <View className="flex-row items-center gap-3 rounded-[17px] bg-[#FFF7DC] p-4">
      <View className="size-9 rounded-[11px] bg-butter" />
      <Text className="min-w-0 flex-1 text-[14px] leading-5 text-ink-navy">
        {recommendation.text}
      </Text>
    </View>
  );
}
