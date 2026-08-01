import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { AnalyticsSectionState } from '../components/analytics/AnalyticsSectionState';
import { WeeklyTrendsChart } from '../components/analytics/WeeklyTrendsChart';
import type { DashboardTrendPoint } from '../types/analytics';

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): {
    root: {
      findAllByType(type: unknown): Array<{ props: Record<string, unknown> }>;
      findAll(predicate: (node: { props: Record<string, unknown> }) => boolean): Array<{ props: Record<string, unknown> }>;
    };
    toJSON(): unknown;
    update(element: React.ReactElement): void;
  };
};

const point = (date: string, overrides: Partial<DashboardTrendPoint> = {}): DashboardTrendPoint => ({
  date,
  caloriesKcal: 1800,
  proteinG: null,
  carbohydrateG: null,
  fatG: null,
  healthyScore: 72,
  goalAdherence: 0.72,
  dataCompleteness: 1,
  ...overrides,
});

function renderedText(tree: unknown): string {
  return JSON.stringify(tree);
}

describe('analytics UI components', () => {
  it('offers one data-driven SVG chart with the three metric controls', async () => {
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(
        <WeeklyTrendsChart points={[point('2026-08-01'), point('2026-08-02', { healthyScore: 85 })]} />,
      );
    });

    const text = renderedText(renderer!.toJSON());
    expect(text).toContain('Năng lượng');
    expect(text).toContain('Healthy Score');
    expect(text).toContain('Mức bám mục tiêu');
    expect(text).toContain('Năng lượng (calories), 7 ngày: 2 điểm đo, 0 điểm thiếu.');
    expect(renderer!.root.findAllByType(Svg)).toHaveLength(1);
    expect(renderer!.root.findAll(({ props }) => props.accessibilityLabel === 'Healthy Score')).not.toHaveLength(0);
  });

  it('uses data-driven chart geometry, gaps, and text-marked incomplete data', async () => {
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(
        <WeeklyTrendsChart
          points={[
            point('2026-08-01', { caloriesKcal: 1800 }),
            point('2026-08-02', { caloriesKcal: null }),
            point('2026-08-03', { caloriesKcal: 3600, dataCompleteness: 0.5 }),
          ]}
        />,
      );
    });

    const treeText = renderedText(renderer!.toJSON());
    const paths = renderer!.root.findAllByType(Path);
    const circles = renderer!.root.findAllByType(Circle);

    expect(paths).toHaveLength(2);
    expect(paths.every(({ props }) => !String(props.d).includes('NaN'))).toBe(true);
    expect(circles.some(({ props }) => props.fill === 'transparent')).toBe(true);
    expect(treeText).toContain('Dữ liệu chưa đầy đủ');
    expect(treeText).toContain('Năng lượng (calories), 7 ngày: 2 điểm đo, 1 điểm thiếu.');
  });

  it('shows loading, neutral empty, and retryable safe error states', async () => {
    const onRetry = jest.fn();
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<AnalyticsSectionState status="loading" />);
    });
    expect(renderedText(renderer!.toJSON())).toContain('Đang tải dữ liệu');

    await TestRenderer.act(async () => {
      renderer!.update(<AnalyticsSectionState status="empty" />);
    });
    expect(renderedText(renderer!.toJSON())).toContain('Chưa có dữ liệu để hiển thị');

    await TestRenderer.act(async () => {
      renderer!.update(
        <AnalyticsSectionState
          status="error"
          errorMessage="JWT abc.def.ghi from server"
          onRetry={onRetry}
        />,
      );
    });

    const errorText = renderedText(renderer!.toJSON());
    expect(errorText).toContain('Chúng tôi chưa thể tải dữ liệu lúc này');
    expect(errorText).not.toContain('JWT abc.def.ghi');
    expect(renderer!.root.findAll(({ props }) => props.accessibilityLabel === 'Thử lại tải dữ liệu')).not.toHaveLength(0);
    expect(onRetry).not.toHaveBeenCalled();
  });
});