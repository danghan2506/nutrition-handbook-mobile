import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import {
  buildTrendSeries,
  getTrendMetricConfig,
  type TrendMetric,
} from '@/lib/analytics-chart';
import type { TrendPoint } from '@/types/analytics';

interface WeeklyTrendsChartProps {
  points: TrendPoint[];
  periodDays?: 7 | 30;
}

const metrics: TrendMetric[] = ['calories', 'healthyScore', 'goalAdherence'];

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({ points, periodDays }) => {
  const [metric, setMetric] = useState<TrendMetric>('calories');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [width, setWidth] = useState(320);

  const chartPeriodDays: 7 | 30 = periodDays ?? (points.length > 7 ? 30 : 7);
  const series = useMemo(
    () => buildTrendSeries(points, metric, Math.max(width - 32, 1), 135, chartPeriodDays),
    [points, metric, width, chartPeriodDays]
  );
  const config = getTrendMetricConfig(metric);
  const chartHeight = 175;
  const baselineY = 135;

  const continuousPoints = useMemo(() => {
    return series.points.map((p) => ({
      ...p,
      y: p.y === null ? baselineY : p.y,
    }));
  }, [series.points, baselineY]);

  const continuousPathD = useMemo(() => {
    if (continuousPoints.length === 0) return '';
    let d = `M ${continuousPoints[0].x} ${continuousPoints[0].y}`;
    for (let i = 1; i < continuousPoints.length; i++) {
      d += ` L ${continuousPoints[i].x} ${continuousPoints[i].y}`;
    }
    return d;
  }, [continuousPoints]);

  const continuousAreaD = useMemo(() => {
    if (continuousPoints.length === 0) return '';
    const first = continuousPoints[0];
    const last = continuousPoints[continuousPoints.length - 1];
    let d = `M ${first.x} ${baselineY} L ${first.x} ${first.y}`;
    for (let i = 1; i < continuousPoints.length; i++) {
      d += ` L ${continuousPoints[i].x} ${continuousPoints[i].y}`;
    }
    d += ` L ${last.x} ${baselineY} Z`;
    return d;
  }, [continuousPoints, baselineY]);

  const activePoint = useMemo(() => {
    if (selectedDate) {
      const found = series.points.find((p) => p.date === selectedDate);
      if (found && found.value !== null) return found;
    }
    for (let i = series.points.length - 1; i >= 0; i--) {
      if (series.points[i].value !== null) return series.points[i];
    }
    return null;
  }, [series.points, selectedDate]);

  const chartWidth = Math.max(width - 32, 1);

  return (
    <View
      className="bg-white rounded-2xl p-5 mx-4 mb-3 border border-[#F0EAE1]"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityLabel={series.accessibilitySummary}
    >
      {/* Header Title */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[#2F3542] font-bold text-base">
          Xu hướng {periodDays ?? series.periodDays} ngày
        </Text>
        <Text className="text-xs font-medium text-[#697386]">{config.unit}</Text>
      </View>

      {/* Metric Selector Tabs */}
      <View className="flex-row bg-[#F0EAE1] rounded-xl p-1 mb-3">
        {metrics.map((item) => {
          const itemConfig = getTrendMetricConfig(item);
          const isSelected = item === metric;
          return (
            <Pressable
              key={item}
              onPress={() => {
                setMetric(item);
                setSelectedDate(null);
              }}
              accessibilityRole="button"
              accessibilityLabel={itemConfig.label}
              accessibilityState={{ selected: isSelected }}
              className={`flex-1 min-h-[44px] px-2 rounded-lg items-center justify-center ${
                isSelected ? 'bg-[#EAF0ED]' : ''
              }`}
            >
              <Text
                className={`text-xs text-[#2F3542] text-center ${
                  isSelected ? 'font-bold' : 'font-normal'
                }`}
              >
                {itemConfig.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* SVG Chart */}
      <View className="items-center" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <Svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          accessibilityLabel={series.accessibilitySummary}
        >
          <Defs>
            <LinearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FF9E7A" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FF9E7A" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Gradient Area Fill (stroke="none" so no drop lines or X-axis baseline) */}
          <Path
            d={continuousAreaD}
            fill="url(#trendGradient)"
            stroke="none"
          />

          {/* Continuous Trend Line Path */}
          <Path
            d={continuousPathD}
            fill="none"
            stroke="#C97B5B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Solid Data Points for Measured Days */}
          {series.points.map((point) => {
            if (point.value === null) return null;
            const isSelected = activePoint?.date === point.date;
            if (isSelected) return null;

            return (
              <Circle
                key={point.date}
                cx={point.x}
                cy={point.y!}
                r="4.5"
                fill="#C97B5B"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            );
          })}

          {/* Selected Active Point Highlight Circle */}
          {activePoint && activePoint.y !== null && (
            <Circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="7"
              fill="#FF9E7A"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          )}

          {/* Invisible Press Targets for Touch Selection */}
          {series.points.map((point) =>
            point.y === null ? null : (
              <Circle
                key={`touch-${point.date}`}
                cx={point.x}
                cy={point.y}
                r="18"
                fill="transparent"
                onPress={() => setSelectedDate(point.date)}
              />
            )
          )}

          {/* X-Axis Labels */}
          {series.xAxisLabels.map((label) => {
            const isSelected = activePoint?.date === label.date;
            return (
              <SvgText
                key={label.date}
                x={label.x}
                y="162"
                fill={isSelected ? '#2F3542' : '#697386'}
                fontSize={isSelected ? '11' : '10'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {label.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <Text className="text-xs text-[#697386] mt-2">{series.accessibilitySummary}</Text>
      {series.missingCount > 0 ? (
        <Text className="text-xs text-[#9B4135] mt-1">
          Dữ liệu chưa đầy đủ ở {series.missingCount} ngày; khoảng trống không đại diện cho mức 0.
        </Text>
      ) : null}
    </View>
  );
};

