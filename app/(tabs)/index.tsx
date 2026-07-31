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
import type { DashboardData } from '@/types/dashboard';

type HomeState =
  | { status: 'loading' }
  | { status: 'ready'; data: DashboardData }
  | { status: 'empty' }
  | { status: 'error' };

export default function HomeScreen() {
  const today = useMemo(
    () => getBusinessDate(new Date(), DASHBOARD_MOCK_TIMEZONE),
    [],
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [state, setState] = useState<HomeState>({ status: 'loading' });
  const [reloadVersion, setReloadVersion] = useState(0);
  const week = useMemo(() => getCalendarWeek(selectedDate), [selectedDate]);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    dashboardDataSource.getDashboard(selectedDate)
      .then((data) => {
        if (active) {
          setState(data ? { status: 'ready', data } : { status: 'empty' });
        }
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [selectedDate, reloadVersion]);

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-28 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-[440px] gap-6">
        <TodayHeader
          selectedDate={selectedDate}
          today={today}
          onReturnToToday={() => setSelectedDate(today)}
        />
        <WeekDatePicker
          days={week}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={setSelectedDate}
        />

        {state.status === 'loading' ? <HomeLoadingState /> : null}
        {state.status === 'empty' ? <HomeEmptyState /> : null}
        {state.status === 'error' ? (
          <HomeErrorState onRetry={() => setReloadVersion((version) => version + 1)} />
        ) : null}
        {state.status === 'ready' ? (
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
