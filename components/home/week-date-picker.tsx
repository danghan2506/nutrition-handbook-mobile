import { Pressable, Text, View } from 'react-native';

import type { CalendarDay } from '@/lib/dashboard-date';

type WeekDatePickerProps = {
  days: CalendarDay[];
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
};

export function WeekDatePicker({
  days,
  selectedDate,
  today,
  onSelectDate,
}: WeekDatePickerProps) {
  return (
    <View className="flex-row gap-1" accessibilityRole="radiogroup">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        const isToday = day.date === today;

        return (
          <Pressable
            key={day.date}
            accessibilityRole="button"
            accessibilityLabel={`${day.weekdayLabel}, ngày ${day.dayOfMonth}${
              isToday ? ', hôm nay' : ''
            }`}
            accessibilityHint={isToday ? 'Hôm nay' : undefined}
            accessibilityState={{ selected: isSelected }}
            className={`min-h-11 flex-1 items-center justify-center rounded-xl border px-1 py-2 active:bg-peach ${
              isSelected ? 'border-apricot bg-peach' : 'border-transparent bg-surface'
            }`}
            onPress={() => onSelectDate(day.date)}>
            <Text
              className={`text-[12px] font-bold ${
                isSelected ? 'text-ink-navy' : 'text-soft-slate'
              }`}>
              {day.weekdayLabel}
            </Text>
            <Text
              className={`mt-1 text-[15px] font-bold ${
                isSelected ? 'text-ink-navy' : 'text-soft-slate'
              }`}>
              {day.dayOfMonth}
            </Text>
            {isToday ? (
              <Text className="mt-1 text-[10px] font-bold text-terracotta">Hôm nay</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}