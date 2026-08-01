import React from 'react';
import { Pressable } from 'react-native';

import { AnalyticsSegmentControl } from '../components/analytics/AnalyticsSegmentControl';
import { DailyHealthyScoreCard } from '../components/analytics/DailyHealthyScoreCard';
import { NutrientDetailsList } from '../components/analytics/NutrientDetailsList';
import { TopRecommendationsCard } from '../components/analytics/TopRecommendationsCard';
import { WeightSummaryCard } from '../components/analytics/WeightSummaryCard';
import type { DailyAssessmentData } from '../types/analytics';

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): {
    root: {
      findAllByType(type: unknown): Array<{ props: Record<string, unknown> }>;
      findAll(predicate: (node: { props: Record<string, unknown> }) => boolean): Array<{ props: Record<string, unknown> }>;
    };
    toJSON(): unknown;
  };
};

const renderText = async (element: React.ReactElement): Promise<string> => {
  let renderer: ReturnType<typeof TestRenderer.create> | undefined;
  await TestRenderer.act(async () => {
    renderer = TestRenderer.create(element);
  });
  return JSON.stringify(renderer?.toJSON());
};

const nutritionSummary: DailyAssessmentData['nutritionSummary'] = {
  caloriesKcal: null,
  proteinG: null,
  carbohydrateG: null,
  fatG: null,
  fiberG: null,
  sugarG: null,
  sodiumMg: null,
};

const emptyTargets: DailyAssessmentData['targets'] = {
  caloriesKcal: {},
  proteinG: {},
  fiberG: {},
  sodiumMg: {},
};

describe('analytics cards', () => {
  it('keeps score presentation neutral until a ready assessment has complete values', async () => {
    const pending = await renderText(
      <DailyHealthyScoreCard status="PENDING" score={null} level={null} mealCount={null} />,
    );
    expect(pending).toContain('Đang chờ dữ liệu đánh giá');
    expect(pending).not.toContain('/ 100');

    const ready = await renderText(
      <DailyHealthyScoreCard status="READY" score={82} level="GOOD" mealCount={3} />,
    );
    expect(ready).toContain('82');
    expect(ready).toContain('/ 100');
    expect(ready).toContain('Mức tốt');
  });

  it('does not invent nutrient targets or render NaN when values are unavailable', async () => {
    const text = await renderText(
      <NutrientDetailsList nutritionSummary={nutritionSummary} targets={emptyTargets} />,
    );
    expect(text).toContain('Chưa có dữ liệu');
    expect(text).toContain('Chưa có mục tiêu');
    expect(text).not.toContain('2000');
    expect(text).not.toContain('100g');
    expect(text).not.toContain('25g');
    expect(text).not.toContain('NaN');
  });

  it('prefers reviewed LLM recommendation copy and has a neutral empty state', async () => {
    const recommendations: DailyAssessmentData['recommendations'] = [
      {
        recommendationCode: 'A',
        priority: 'HIGH',
        templateText: 'Bản mẫu hỗ trợ',
        llmText: 'Gợi ý đã được cá nhân hóa',
      },
      {
        recommendationCode: 'B',
        priority: 'LOW',
        templateText: 'Gợi ý dự phòng',
        llmText: '   ',
      },
    ];
    const text = await renderText(<TopRecommendationsCard recommendations={recommendations} />);
    expect(text).toContain('Gợi ý đã được cá nhân hóa');
    expect(text).toContain('Gợi ý dự phòng');
    expect(text).not.toContain('Bản mẫu hỗ trợ');

    expect(await renderText(<TopRecommendationsCard recommendations={[]} />)).toContain(
      'Chưa có khuyến nghị',
    );
  });

  it('labels weight direction neutrally and includes the first measurement context', async () => {
    const text = await renderText(
      <WeightSummaryCard
        latestWeightKg={68.2}
        changeFromFirstKg={0.4}
        periodDays={30}
        firstOccurredAt="2026-07-01T07:00:00+07:00"
      />,
    );
    expect(text).toContain('Tăng');
    expect(text).toContain('01/07/2026');
    expect(text).not.toContain('isLoss');

    const missing = await renderText(
      <WeightSummaryCard
        latestWeightKg={null}
        changeFromFirstKg={null}
        periodDays={null}
        firstOccurredAt={null}
      />,
    );
    expect(missing).toContain('Chưa có dữ liệu');
    expect(missing).not.toContain('NaN');
  });

  it('keeps segmented tabs accessible and tappable at a 44px minimum', async () => {
    const onSelectTab = jest.fn();
    let renderer: ReturnType<typeof TestRenderer.create> | undefined;
    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(
        <AnalyticsSegmentControl activeTab="overview" onSelectTab={onSelectTab} />,
      );
    });
    const overviewTab = renderer!.root.findAll(({ props }) => props.accessibilityLabel === 'Tổng Quan' && typeof props.onPress === 'function')[0];
    const detailsTab = renderer!.root.findAll(({ props }) => props.accessibilityLabel === 'Chi Tiết Dinh Dưỡng' && typeof props.onPress === 'function')[0];
    expect(overviewTab).toBeDefined();
    expect(detailsTab).toBeDefined();
    expect(overviewTab.props.accessibilityRole).toBe('tab');
    expect(overviewTab.props.accessibilityState).toEqual({ selected: true });
    expect(String(overviewTab.props.className)).toContain('min-h-[44px]');
    detailsTab.props.onPress();
    expect(onSelectTab).toHaveBeenCalledWith('details');
  });
});