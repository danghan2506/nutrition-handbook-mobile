import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalyticsSegmentControl, AnalyticsTab } from '../../components/analytics/AnalyticsSegmentControl';
import { DailyHealthyScoreCard } from '../../components/analytics/DailyHealthyScoreCard';
import { WeeklyTrendsChart } from '../../components/analytics/WeeklyTrendsChart';
import { TopRecommendationsCard } from '../../components/analytics/TopRecommendationsCard';
import { WeightSummaryCard } from '../../components/analytics/WeightSummaryCard';
import { NutrientDetailsList } from '../../components/analytics/NutrientDetailsList';
import { mockDailyAssessment, mockTrendPoints, mockWeightTrend } from '../../data/mockAnalytics';

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [period, setPeriod] = useState<'7' | '30'>('7');

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F0]">
      {/* Fixed Header */}
      <View className="flex-row justify-between items-center px-4 pt-3 pb-2">
        <View>
          <Text className="text-2xl font-bold text-[#2F3542]">Phân Tích Dinh Dưỡng</Text>
          <Text className="text-xs text-[#697386]">Theo dõi xu hướng & sức khỏe bữa ăn</Text>
        </View>

        {/* Time Period Selector Pill */}
        <View className="flex-row bg-[#F0EAE1] p-1 rounded-full">
          <Pressable
            onPress={() => setPeriod('7')}
            className={`px-3 py-1 rounded-full ${
              period === '7' ? 'bg-[#FF9E7A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                period === '7' ? 'text-white' : 'text-[#697386]'
              }`}
            >
              7 ngày
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPeriod('30')}
            className={`px-3 py-1 rounded-full ${
              period === '30' ? 'bg-[#FF9E7A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                period === '30' ? 'text-white' : 'text-[#697386]'
              }`}
            >
              30 ngày
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sub-tab Segment Control */}
      <AnalyticsSegmentControl activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Scrollable Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {activeTab === 'overview' ? (
          <>
            <DailyHealthyScoreCard
              score={mockDailyAssessment.score}
              level={mockDailyAssessment.level}
              mealCount={mockDailyAssessment.mealCount}
            />
            <WeeklyTrendsChart points={mockTrendPoints} />
            <TopRecommendationsCard
              recommendations={mockDailyAssessment.recommendations}
            />
            <WeightSummaryCard
              latestWeightKg={mockWeightTrend.latestWeightKg}
              changeFromFirstKg={mockWeightTrend.changeFromFirstKg}
              periodDays={mockWeightTrend.periodDays}
            />
          </>
        ) : (
          <NutrientDetailsList
            nutritionSummary={mockDailyAssessment.nutritionSummary}
            targets={mockDailyAssessment.targets}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
