import { useEffect, useMemo, useState } from 'react';

import { DailyNutritionSummary } from '@/components/home/daily-nutrition-summary';
import {
  HomeEmptyState,
  HomeErrorState,
  HomeLoadingState,
} from '@/components/home/home-placeholder-state';
import { MealSummaryList } from '@/components/home/meal-summary-list';
import { RecommendationBanner } from '@/components/home/recommendation-banner';
import { TodayHeader } from '@/components/home/today-header';
import { WeekDatePicker } from '@/components/home/week-date-picker';
import { ScrollView, View } from '@/components/ui/tw';
import {
  dashboardDataSource,
  DASHBOARD_MOCK_TIMEZONE,
} from '@/data/dashboard-mock';
import { getBusinessDate, getCalendarWeek } from '@/lib/dashboard-date';
import {
  createHomeDashboardRequestController,
  type HomeDashboardState,
} from '@/lib/home-dashboard-request';
import { HOME_CONTENT_LAYOUT } from '@/lib/week-date-picker-layout';

export default function HomeScreen() {
  const today = useMemo(
    () => getBusinessDate(new Date(), DASHBOARD_MOCK_TIMEZONE),
    [],
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [state, setState] = useState<HomeDashboardState>({
    status: 'loading',
    date: today,
  });
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestController = useMemo(
    () => createHomeDashboardRequestController(setState),
    [],
  );
  const week = useMemo(() => getCalendarWeek(selectedDate), [selectedDate]);
  const isCurrentState = state.date === selectedDate;

  function handleSelectDate(date: string) {
    if (date === selectedDate) return;

    requestController.invalidate();
    setState({ status: 'loading', date });
    setSelectedDate(date);
  }

  function handleRetry() {
    requestController.invalidate();
    setState({ status: 'loading', date: selectedDate });
    setReloadVersion((version) => version + 1);
  }

  useEffect(() => {
    return requestController.request(
      selectedDate,
      () => dashboardDataSource.getDashboard(selectedDate),
    );
  }, [requestController, reloadVersion, selectedDate]);

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-28 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <View
        className={`mx-auto w-full gap-6 ${HOME_CONTENT_LAYOUT.maxWidthClassName}`}>
        <TodayHeader
          selectedDate={selectedDate}
          today={today}
          onReturnToToday={() => handleSelectDate(today)}
        />
        <WeekDatePicker
          days={week}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={handleSelectDate}
        />

        {isCurrentState && state.status === 'loading' ? <HomeLoadingState /> : null}
        {isCurrentState && state.status === 'empty' ? <HomeEmptyState /> : null}
        {isCurrentState && state.status === 'error' ? (
          <HomeErrorState onRetry={handleRetry} />
        ) : null}
        {isCurrentState && state.status === 'ready' ? (
          <>
            <DailyNutritionSummary
              nutritionTotals={state.data.nutritionTotals}
              targets={state.data.targets}
              dailyAssessment={state.data.dailyAssessment}
            />
            <RecommendationBanner recommendation={state.data.topRecommendations[0]} />
            <MealSummaryList meals={state.data.meals} timezone={state.data.timezone} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
