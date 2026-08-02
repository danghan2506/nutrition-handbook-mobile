import React from 'react';
import { View, Text } from 'react-native';

interface WeightSummaryCardProps {
  latestWeightKg?: number | null;
  changeFromFirstKg?: number | null;
  periodDays?: number | null;
  firstOccurredAt?: string | null;
}

const formatFirstDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[3] + '/' + match[2] + '/' + match[1] : value;
};

export const WeightSummaryCard: React.FC<WeightSummaryCardProps> = ({
  latestWeightKg,
  changeFromFirstKg,
  periodDays,
  firstOccurredAt,
}) => {
  const hasLatest = typeof latestWeightKg === 'number' && Number.isFinite(latestWeightKg);
  const hasChange = typeof changeFromFirstKg === 'number' && Number.isFinite(changeFromFirstKg);
  const hasPeriod = typeof periodDays === 'number' && Number.isFinite(periodDays);
  const direction = !hasChange
    ? 'Chưa đủ dữ liệu'
    : changeFromFirstKg > 0
      ? 'Tăng'
      : changeFromFirstKg < 0
        ? 'Giảm'
        : 'Không đổi';
  const dateLabel = formatFirstDate(firstOccurredAt);

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4 shadow-sm border border-[#F0EAE1]">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[#697386] font-medium text-sm">Tiến Trình Cân Nặng</Text>
        <View className="px-2.5 py-1 rounded-full bg-[#EAF0ED]">
          <Text className="font-semibold text-xs text-[#2F3542]">
            {direction}
            {hasChange ? ' ' + (changeFromFirstKg > 0 ? '+' : '') + changeFromFirstKg + ' kg' : ''}
            {hasPeriod ? ' (' + periodDays + ' ngày)' : ''}
          </Text>
        </View>
      </View>

      <View className="flex-row items-baseline">
        <Text className="text-3xl font-bold text-[#2F3542]">
          {hasLatest ? latestWeightKg : 'Chưa có dữ liệu'}
        </Text>
        {hasLatest && <Text className="text-base font-medium text-[#697386] ml-1">kg</Text>}
      </View>
      {dateLabel && (
        <Text className="text-xs text-[#697386] mt-2">Tính từ lần đo đầu: {dateLabel}</Text>
      )}
    </View>
  );
};