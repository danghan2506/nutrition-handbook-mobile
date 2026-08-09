import type { DashboardTrendPoint, WeightTrendData } from '../types/analytics';

export type TrendMetric = 'calories' | 'healthyScore' | 'goalAdherence';

export interface TrendMetricConfig {
  label: string;
  unit: string;
  formatValue: (value: number) => string;
}

export interface TrendChartPoint {
  date: string;
  value: number | null;
  x: number;
  y: number | null;
}

export interface TrendAxisLabel {
  date: string;
  label: string;
  x: number;
}

export interface TrendSeries {
  metric: TrendMetric;
  periodDays: 7 | 30;
  domain: { min: number; max: number };
  points: TrendChartPoint[];
  pathSegments: string[];
  xAxisLabels: TrendAxisLabel[];
  measuredCount: number;
  missingCount: number;
  accessibilitySummary: string;
}

export interface WeightTrendSummary {
  latestWeightKg: number;
  changeFromFirstKg: number;
  firstOccurredAt: string | null;
  periodDays: 7 | 30;
  description: string;
  accessibilitySummary: string;
}

const metricConfigs: Record<TrendMetric, TrendMetricConfig> = {
  calories: {
    label: 'Năng lượng',
    unit: 'kcal',
    formatValue: (value) => `${formatChartNumber(value)} kcal`,
  },
  healthyScore: {
    label: 'Healthy Score',
    unit: 'điểm',
    formatValue: (value) => `${formatChartNumber(value)} / 100`,
  },
  goalAdherence: {
    label: 'Mức bám mục tiêu',
    unit: '%',
    formatValue: (value) => `${formatChartNumber(value)}%`,
  },
};

function formatChartNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function getDisplayValue(point: DashboardTrendPoint, metric: TrendMetric): number | null {
  const value = metric === 'calories'
    ? point.caloriesKcal
    : metric === 'healthyScore'
      ? point.healthyScore
      : point.goalAdherence === null
        ? null
        : point.goalAdherence * 100;

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getSafeDimension(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getCaloriesDomain(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };

  const measuredMin = Math.min(...values);
  const measuredMax = Math.max(...values);
  const padding = Math.max(
    (measuredMax - measuredMin) * 0.05,
    Math.max(Math.abs(measuredMin), Math.abs(measuredMax), 1) * 0.05,
    1,
  );

  return {
    min: Math.max(0, measuredMin - padding),
    max: measuredMax + padding,
  };
}

function getPointX(index: number, pointCount: number, width: number, paddingX: number): number {
  if (pointCount <= 1) return width / 2;
  const usableWidth = width - 2 * paddingX;
  if (usableWidth <= 0) return width / 2;
  return paddingX + (index / (pointCount - 1)) * usableWidth;
}

function formatDateLabel(date: string): string {
  const [, month = '', day = ''] = date.split('-');
  return month && day ? `${day}/${month}` : date;
}

function getAxisLabels(points: TrendChartPoint[], periodDays: 7 | 30): TrendAxisLabel[] {
  if (periodDays === 7) {
    return points.map(({ date, x }) => ({ date, x, label: formatDateLabel(date) }));
  }

  const labelCount = Math.min(6, points.length);
  if (labelCount === 0) return [];
  if (labelCount === 1) {
    const [point] = points;
    return [{ date: point.date, x: point.x, label: formatDateLabel(point.date) }];
  }

  return Array.from({ length: labelCount }, (_, labelIndex) => {
    const pointIndex = Math.round((labelIndex * (points.length - 1)) / (labelCount - 1));
    const point = points[pointIndex];
    return { date: point.date, x: point.x, label: formatDateLabel(point.date) };
  });
}

function buildPathSegments(points: TrendChartPoint[]): string[] {
  const pathSegments: string[] = [];
  let activePathIndex: number | null = null;

  points.forEach(({ x, y }) => {
    if (y === null) {
      activePathIndex = null;
      return;
    }

    if (activePathIndex === null) {
      pathSegments.push(`M ${x} ${y}`);
      activePathIndex = pathSegments.length - 1;
      return;
    }

    pathSegments[activePathIndex] += ` L ${x} ${y}`;
  });

  return pathSegments;
}

function createPolygonPoints(group: TrendChartPoint[], baselineY: number): string {
  if (group.length === 0) return '';
  const first = group[0];
  const last = group[group.length - 1];
  const pts = group.map((p) => `${p.x},${p.y}`).join(' ');
  return `${first.x},${baselineY} ${pts} ${last.x},${baselineY}`;
}

export function buildAreaPolygonPoints(points: TrendChartPoint[], baselineY: number): string[] {
  const areaPolygons: string[] = [];
  let currentGroup: TrendChartPoint[] = [];

  points.forEach((pt) => {
    if (pt.y === null) {
      if (currentGroup.length > 0) {
        areaPolygons.push(createPolygonPoints(currentGroup, baselineY));
        currentGroup = [];
      }
    } else {
      currentGroup.push(pt);
    }
  });

  if (currentGroup.length > 0) {
    areaPolygons.push(createPolygonPoints(currentGroup, baselineY));
  }

  return areaPolygons;
}

export function getTrendMetricConfig(metric: TrendMetric): TrendMetricConfig {
  return metricConfigs[metric];
}

export function buildTrendSeries(
  inputPoints: DashboardTrendPoint[],
  metric: TrendMetric,
  width: number,
  height: number,
  requestedPeriodDays?: 7 | 30,
): TrendSeries {
  const safeWidth = getSafeDimension(width);
  const safeHeight = getSafeDimension(height);
  const paddingX = Math.max(20, Math.min(28, safeWidth * 0.08));
  const values = inputPoints.map((point) => getDisplayValue(point, metric));
  const measuredValues = values.filter((value): value is number => value !== null);
  const domain = metric === 'calories'
    ? getCaloriesDomain(measuredValues)
    : { min: 0, max: 100 };
  const domainSpan = domain.max - domain.min || 1;
  const points = inputPoints.map((point, index): TrendChartPoint => {
    const value = values[index];
    const x = getPointX(index, inputPoints.length, safeWidth, paddingX);
    const y = value === null ? null : safeHeight - ((value - domain.min) / domainSpan) * safeHeight;

    return {
      date: point.date,
      value,
      x,
      y,
    };
  });
  const periodDays: 7 | 30 = requestedPeriodDays ?? (inputPoints.length > 7 ? 30 : 7);
  const config = getTrendMetricConfig(metric);
  const missingCount = inputPoints.length - measuredValues.length;

  return {
    metric,
    periodDays,
    domain,
    points,
    pathSegments: buildPathSegments(points),
    xAxisLabels: getAxisLabels(points, periodDays),
    measuredCount: measuredValues.length,
    missingCount,
    accessibilitySummary: `${config.label} (${metric}), ${periodDays} ngày: ${measuredValues.length} điểm đo, ${missingCount} điểm thiếu.`,
  };
}

function formatVietnameseNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);
}

export function summarizeWeightTrend(
  trend: WeightTrendData,
  periodDays: 7 | 30,
): WeightTrendSummary {
  const magnitude = formatVietnameseNumber(Math.abs(trend.changeFromFirstKg));
  const periodLabel = `${periodDays} ngày qua`;
  const description = trend.changeFromFirstKg < 0
    ? `Giảm ${magnitude} kg trong ${periodLabel}`
    : trend.changeFromFirstKg > 0
      ? `Tăng ${magnitude} kg trong ${periodLabel}`
      : `Không đổi trong ${periodLabel}`;

  return {
    latestWeightKg: trend.latestWeightKg,
    changeFromFirstKg: trend.changeFromFirstKg,
    firstOccurredAt: trend.firstOccurredAt,
    periodDays,
    description,
    accessibilitySummary: `Cân nặng gần nhất ${formatVietnameseNumber(trend.latestWeightKg)} kg. ${description}.`,
  };
}
