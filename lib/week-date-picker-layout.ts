export const HOME_CONTENT_HORIZONTAL_PADDING = 20;
export const HOME_CONTENT_MAX_WIDTH = 440;
export const MIN_WEEK_DATE_TARGET_SIZE = 44;
export const WEEK_DATE_COUNT = 7;

const MIN_REGULAR_CONTENT_WIDTH = WEEK_DATE_COUNT * MIN_WEEK_DATE_TARGET_SIZE;

export type WeekDatePickerLayout = {
  isFullBleed: boolean;
  stripWidth: number;
  horizontalMargin: number;
  dayWidth: number;
};

export function getWeekDatePickerLayout(viewportWidth: number): WeekDatePickerLayout {
  const contentWidth = Math.min(
    Math.max(viewportWidth - HOME_CONTENT_HORIZONTAL_PADDING * 2, 0),
    HOME_CONTENT_MAX_WIDTH,
  );
  const isFullBleed = contentWidth < MIN_REGULAR_CONTENT_WIDTH;
  const stripWidth = isFullBleed ? viewportWidth : contentWidth;

  return {
    isFullBleed,
    stripWidth,
    horizontalMargin: isFullBleed ? -HOME_CONTENT_HORIZONTAL_PADDING : 0,
    dayWidth: stripWidth / WEEK_DATE_COUNT,
  };
}
