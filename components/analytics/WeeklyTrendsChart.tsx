import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { buildTrendSeries, getTrendMetricConfig, type TrendMetric } from '@/lib/analytics-chart';
import type { TrendPoint } from '@/types/analytics';

interface WeeklyTrendsChartProps { points: TrendPoint[]; periodDays?: 7 | 30; }
const metrics: TrendMetric[] = ['calories', 'healthyScore', 'goalAdherence'];

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({ points, periodDays }) => {
  const [metric, setMetric] = useState<TrendMetric>('calories');
  const [width, setWidth] = useState(320);
  const series = useMemo(() => buildTrendSeries(points, metric, Math.max(width - 32, 1), 150), [points, metric, width]);
  const config = getTrendMetricConfig(metric);
  const chartHeight = 180;

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-3 border border-[#F0EAE1]" onLayout={(event) => setWidth(event.nativeEvent.layout.width)} accessibilityLabel={series.accessibilitySummary}>
      <View className="flex-row justify-between items-center mb-3"><Text className="text-[#2F3542] font-semibold text-base">Xu hướng {periodDays ?? series.periodDays} ngày</Text><Text className="text-xs text-[#697386]">{config.unit}</Text></View>
      <View className="flex-row bg-[#F0EAE1] rounded-xl p-1 mb-3">
        {metrics.map((item) => { const itemConfig = getTrendMetricConfig(item); return <Pressable key={item} onPress={() => setMetric(item)} accessibilityRole="button" accessibilityLabel={itemConfig.label} accessibilityState={{ selected: item === metric }} className={`flex-1 min-h-[44px] px-2 rounded-lg items-center justify-center ${item === metric ? 'bg-[#EAF0ED]' : ''}`}><Text className="text-xs text-[#2F3542] text-center">{itemConfig.label}</Text></Pressable>; })}
      </View>
      <View className="items-center" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${Math.max(width - 32, 1)} ${chartHeight}`} accessibilityLabel={series.accessibilitySummary}>
          <Line x1="0" y1={150} x2={Math.max(width - 32, 1)} y2={150} stroke="#D9DDD5" strokeWidth="1" />
          {series.pathSegments.map((d) => <Path key={d} d={d} fill="none" stroke="#C97B5B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
          {series.points.map((point) => point.y === null ? null : <Circle key={point.date} cx={point.x} cy={point.y} r="5" fill={points.find((item) => item.date === point.date)?.dataCompleteness === 1 ? '#C97B5B' : 'transparent'} stroke="#C97B5B" strokeWidth="2" />)}
          {series.xAxisLabels.map((label) => <SvgText key={label.date} x={label.x} y="173" fill="#5E5C56" fontSize="10" textAnchor="middle">{label.label}</SvgText>)}
        </Svg>
      </View>
      <Text className="text-xs text-[#5E5C56] mt-2">{series.accessibilitySummary}</Text>
      {series.missingCount > 0 ? <Text className="text-xs text-[#9B4135] mt-1">Dữ liệu chưa đầy đủ ở {series.missingCount} ngày; khoảng trống không đại diện cho mức 0.</Text> : null}
    </View>
  );
};
