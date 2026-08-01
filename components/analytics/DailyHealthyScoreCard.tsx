import React from 'react';
import { View, Text } from 'react-native';
import { AssessmentStatus, HealthyLevel } from '../../types/analytics';

interface DailyHealthyScoreCardProps {
  score?: number | null;
  level?: HealthyLevel | null;
  mealCount?: number | null;
  status?: AssessmentStatus;
}

const levelConfig: Record<HealthyLevel, { label: string; bg: string; text: string }> = {
  EXCELLENT: { label: 'Xuất sắc', bg: 'bg-[#9BCB8D]', text: 'text-white' },
  GOOD: { label: 'Mức tốt', bg: 'bg-[#EAF0ED]', text: 'text-[#2F3542]' },
  FAIR: { label: 'Khá', bg: 'bg-[#FFD66B]/30', text: 'text-[#2F3542]' },
  NEEDS_ATTENTION: { label: 'Cần chú ý', bg: 'bg-[#FFF0E7]', text: 'text-[#FF8B78]' },
};

const statusCopy: Record<Exclude<AssessmentStatus, 'READY'>, string> = {
  PENDING: 'Đang chờ dữ liệu đánh giá',
  FAILED: 'Chưa thể hoàn tất đánh giá',
  SUPERSEDED: 'Đánh giá này đã được thay thế',
};

export const DailyHealthyScoreCard: React.FC<DailyHealthyScoreCardProps> = ({
  score,
  level,
  mealCount,
  status = 'READY',
}) => {
  const isReady = status === 'READY';
  const hasScore = isReady && typeof score === 'number' && Number.isFinite(score);
  const hasLevel = isReady && level !== null && level !== undefined;
  const hasMealCount = typeof mealCount === 'number' && Number.isFinite(mealCount);

  return (
    <View
      accessible
      accessibilityLabel="Healthy Score Hôm Nay"
      className="bg-white rounded-2xl p-5 mx-4 mb-3 shadow-sm border border-[#F0EAE1]"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[#697386] font-medium text-sm">Healthy Score Hôm Nay</Text>
        {hasLevel && (
          <View className={`px-3 py-1 rounded-full ${levelConfig[level].bg}`}>
            <Text className={`font-semibold text-xs ${levelConfig[level].text}`}>
              {levelConfig[level].label}
            </Text>
          </View>
        )}
      </View>

      {!isReady ? (
        <Text className="text-sm text-[#697386]">{statusCopy[status]}</Text>
      ) : (
        <>
          {hasScore ? (
            <View className="flex-row items-baseline mb-2">
              <Text className="text-4xl font-bold text-[#2F3542] tracking-tight">{score}</Text>
              <Text className="text-lg font-medium text-[#697386] ml-1">/ 100</Text>
            </View>
          ) : (
            <Text className="text-sm text-[#697386] mb-2">Chưa có dữ liệu điểm</Text>
          )}

          <Text className="text-xs text-[#697386]">
            {hasMealCount
              ? `Dựa trên ${mealCount} bữa ăn đã ghi nhận trong ngày.`
              : 'Số bữa ăn chưa được ghi nhận.'}
          </Text>
        </>
      )}
    </View>
  );
};