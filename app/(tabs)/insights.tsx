import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalyticsSegmentControl, type AnalyticsTab } from '../../components/analytics/AnalyticsSegmentControl';
import { DailyHealthyScoreCard } from '../../components/analytics/DailyHealthyScoreCard';
import { WeeklyTrendsChart } from '../../components/analytics/WeeklyTrendsChart';
import { TopRecommendationsCard } from '../../components/analytics/TopRecommendationsCard';
import { WeightSummaryCard } from '../../components/analytics/WeightSummaryCard';
import { NutrientDetailsList } from '../../components/analytics/NutrientDetailsList';
import { mockDailyAssessment, mockTrendPoints, mockWeightTrend } from '../../data/mockAnalytics';
import type { AnalyticsPeriodDays } from '../../types/analytics';

const periods: AnalyticsPeriodDays[] = [7, 30];

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(7);

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
            <DailyHealthyScoreCard status={mockDailyAssessment.status} score={mockDailyAssessment.score} level={mockDailyAssessment.level} mealCount={mockDailyAssessment.mealCount} />
            <WeeklyTrendsChart points={mockTrendPoints} periodDays={periodDays} />
            <TopRecommendationsCard recommendations={mockDailyAssessment.recommendations} />
            <WeightSummaryCard latestWeightKg={mockWeightTrend.latestWeightKg} changeFromFirstKg={mockWeightTrend.changeFromFirstKg} periodDays={periodDays} firstOccurredAt={mockWeightTrend.firstOccurredAt} />
          </>
        ) : (
          <NutrientDetailsList nutritionSummary={mockDailyAssessment.nutritionSummary} targets={mockDailyAssessment.targets} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}