import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import type { CalendarDay } from '@/lib/dashboard-date';
import { getWeekDatePickerLayout } from '@/lib/week-date-picker-layout';

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
  const { width } = useWindowDimensions();
  const layout = getWeekDatePickerLayout(width);

  return (
    <View
      className="w-full flex-row self-center"
      style={{
        width: layout.stripWidth,
        marginHorizontal: layout.horizontalMargin,
      }}
      accessibilityRole="radiogroup"
      accessibilityLabel="Chọn ngày trong tuần">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        const isToday = day.date === today;

        return (
          <Pressable
            key={day.date}
            accessibilityRole="radio"
            accessibilityLabel={`${day.weekdayLabel}, ngày ${day.dayOfMonth}${
              isToday ? ', hôm nay' : ''
            }`}
            accessibilityHint={isToday ? 'Hôm nay' : undefined}
            accessibilityState={{ checked: isSelected }}
            className={`min-h-11 min-w-11 flex-1 items-center justify-center rounded-xl border px-1 py-2 active:bg-peach ${
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
              }`}
              style={{ fontVariant: ['tabular-nums'] }}>
              {day.dayOfMonth}
            </Text>
            <Text
              accessible={false}
              className={`mt-1 text-[14px] leading-4 ${
                isToday ? 'text-terracotta' : 'text-transparent'
              }`}>
              ●
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
