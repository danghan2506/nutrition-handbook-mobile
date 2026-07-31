export const HOME_CONTENT_HORIZONTAL_PADDING = 20;
export const MIN_WEEK_DATE_TARGET_SIZE = 44;
export const WEEK_DATE_COUNT = 7;

const MIN_REGULAR_VIEWPORT_WIDTH =
  WEEK_DATE_COUNT * MIN_WEEK_DATE_TARGET_SIZE + HOME_CONTENT_HORIZONTAL_PADDING * 2;

export type WeekDatePickerLayout = {
  isFullBleed: boolean;
  stripWidth: number;
  horizontalMargin: number;
  dayWidth: number;
};

export function getWeekDatePickerLayout(viewportWidth: number): WeekDatePickerLayout {
  const isFullBleed = viewportWidth < MIN_REGULAR_VIEWPORT_WIDTH;
  const stripWidth = isFullBleed
    ? viewportWidth
    : viewportWidth - HOME_CONTENT_HORIZONTAL_PADDING * 2;

  return {
    isFullBleed,
    stripWidth,
    horizontalMargin: isFullBleed ? -HOME_CONTENT_HORIZONTAL_PADDING : 0,
    dayWidth: stripWidth / WEEK_DATE_COUNT,
  };
}
