export type CalendarDay = {
  date: string;
  weekdayLabel: string;
  dayOfMonth: number;
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseCalendarDate(date: string): Date {
  const match = DATE_PATTERN.exec(date);

  if (!match) {
    throw new Error('Invalid business date');
  }

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12),
  );
}

export function getBusinessDate(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${value.year}-${value.month}-${value.day}`;
}

export function getCalendarWeek(date: string): CalendarDay[] {
  const selected = parseCalendarDate(date);
  const weekday = selected.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;

  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(selected);
    item.setUTCDate(selected.getUTCDate() + mondayOffset + index);

    return {
      date: item.toISOString().slice(0, 10),
      weekdayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
      dayOfMonth: item.getUTCDate(),
    };
  });
}

export function formatBusinessDateLabel(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseCalendarDate(date));
}

export function formatMealTime(instant: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(instant));
}
