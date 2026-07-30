import { Pressable, Text, View } from 'react-native';

import { formatBusinessDateLabel } from '@/lib/dashboard-date';

type TodayHeaderProps = {
  selectedDate: string;
  today: string;
  onReturnToToday: () => void;
};

export function TodayHeader({
  selectedDate,
  today,
  onReturnToToday,
}: TodayHeaderProps) {
  const isCurrentDay = selectedDate === today;

  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-[25px] font-bold text-ink-navy">Nhật ký ăn uống</Text>
        <Text className="mt-1 text-[14px] capitalize text-soft-slate">
          {formatBusinessDateLabel(selectedDate)}
        </Text>
      </View>
      {!isCurrentDay ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Về hôm nay"
          className="h-11 items-center justify-center rounded-xl px-3 active:bg-peach"
          onPress={onReturnToToday}>
          <Text className="text-[14px] font-bold text-terracotta">Về hôm nay</Text>
        </Pressable>
      ) : null}
    </View>
  );
}