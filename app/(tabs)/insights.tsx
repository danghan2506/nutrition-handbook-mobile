import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalyticsSectionState } from '@/components/analytics/AnalyticsSectionState';
import { AnalyticsSegmentControl, type AnalyticsTab } from '@/components/analytics/AnalyticsSegmentControl';
import { DailyHealthyScoreCard } from '@/components/analytics/DailyHealthyScoreCard';
import { NutrientDetailsList } from '@/components/analytics/NutrientDetailsList';
import { TopRecommendationsCard } from '@/components/analytics/TopRecommendationsCard';
import { WeeklyTrendsChart } from '@/components/analytics/WeeklyTrendsChart';
import { WeightSummaryCard } from '@/components/analytics/WeightSummaryCard';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAnalyticsData, type AnalyticsSection } from '@/hooks/use-analytics-data';
import type { AnalyticsPeriodDays } from '@/types/analytics';

const periods: AnalyticsPeriodDays[] = [7, 30];

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(7);
  const { isLoading: authLoading, session } = useAuthSession();
  const accessToken = session?.access_token ?? null;
  const { daily, trends, weight, refresh } = useAnalyticsData({ accessToken, periodDays });

  function renderSectionState<T>(section: AnalyticsSection<T>) {
    if (section.status === 'success') return null;
    return (
      <AnalyticsSectionState
        status={section.status}
        errorMessage={section.status === 'error' ? section.message : undefined}
        onRetry={refresh}
      />
    );
  }

  const renderDaily = () => {
    if (authLoading || !accessToken) return <AnalyticsSectionState status="loading" />;
    if (daily.status !== 'success') return renderSectionState(daily);
    return (
      <>
        <DailyHealthyScoreCard status={daily.data.status} score={daily.data.score} level={daily.data.level} mealCount={daily.data.mealCount} />
        <TopRecommendationsCard recommendations={daily.data.recommendations} />
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F0]">
      <View className="flex-row justify-between items-center px-4 pt-3 pb-2">
        <View>
          <Text className="text-2xl font-bold text-[#2F3542]">Phân Tích Dinh Dưỡng</Text>
          <Text className="text-xs text-[#697386]">Theo dõi xu hướng & sức khỏe bữa ăn</Text>
        </View>
        <View className="flex-row bg-[#F0EAE1] p-1 rounded-full">
          {periods.map((value) => (
            <Pressable key={value} onPress={() => setPeriodDays(value)} accessibilityRole="button" accessibilityLabel={`${value} ngày`} accessibilityState={{ selected: periodDays === value }} className={`px-3 py-1 rounded-full min-h-[44px] items-center justify-center ${periodDays === value ? 'bg-[#FF9E7A]' : 'bg-transparent'}`}>
              <Text className={`text-xs font-semibold ${periodDays === value ? 'text-white' : 'text-[#697386]'}`}>{value} ngày</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <AnalyticsSegmentControl activeTab={activeTab} onSelectTab={setActiveTab} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {activeTab === 'overview' ? (
          <>
            {renderDaily()}
            {authLoading || !accessToken ? <AnalyticsSectionState status="loading" /> : trends.status === 'success' ? <WeeklyTrendsChart points={trends.data.points} periodDays={periodDays} /> : renderSectionState(trends)}
            {authLoading || !accessToken ? <AnalyticsSectionState status="loading" /> : weight.status === 'success' ? <WeightSummaryCard latestWeightKg={weight.data.trend.latestWeightKg} changeFromFirstKg={weight.data.trend.changeFromFirstKg} periodDays={periodDays} firstOccurredAt={weight.data.trend.firstOccurredAt} /> : renderSectionState(weight)}
          </>
        ) : authLoading || !accessToken ? (
          <AnalyticsSectionState status="loading" />
        ) : daily.status === 'success' ? (
          <NutrientDetailsList nutritionSummary={daily.data.nutritionSummary} targets={daily.data.targets} />
        ) : (
          renderSectionState(daily)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}