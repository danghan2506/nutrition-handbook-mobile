type AnalyticsPeriodDays = 7 | 30;

const vietnameseWeekdayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const padDatePart = (value: number) => value.toString().padStart(2, '0');

export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;
}

export function createAnalyticsDateRange(
  periodDays: AnalyticsPeriodDays,
  today: Date = new Date(),
): { from: string; to: string } {
  const to = new Date(today.getTime());
  const from = new Date(today.getTime());
  from.setDate(from.getDate() - (periodDays - 1));

  return {
    from: formatLocalDate(from),
    to: formatLocalDate(to),
  };
}

export function formatTrendDateLabel(
  date: string,
  periodDays: AnalyticsPeriodDays,
): string {
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const dayMonth = `${padDatePart(localDate.getDate())}/${padDatePart(
    localDate.getMonth() + 1,
  )}`;

  if (periodDays === 30) {
    return dayMonth;
  }

  return `${vietnameseWeekdayLabels[localDate.getDay()]}, ${dayMonth}`;
}
