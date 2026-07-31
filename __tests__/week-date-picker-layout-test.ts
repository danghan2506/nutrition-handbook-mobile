import {
  getWeekDatePickerLayout,
  HOME_CONTENT_HORIZONTAL_PADDING,
  MIN_WEEK_DATE_TARGET_SIZE,
  WEEK_DATE_COUNT,
} from '@/lib/week-date-picker-layout';

test('uses the viewport as a full-bleed strip on a 320px phone', () => {
  const layout = getWeekDatePickerLayout(320);

  expect(layout).toEqual({
    isFullBleed: true,
    stripWidth: 320,
    horizontalMargin: -HOME_CONTENT_HORIZONTAL_PADDING,
    dayWidth: 320 / WEEK_DATE_COUNT,
  });
  expect(layout.dayWidth).toBeGreaterThanOrEqual(MIN_WEEK_DATE_TARGET_SIZE);
});

test('keeps the normal 20px content alignment once seven targets fit', () => {
  const fittingViewportWidth =
    WEEK_DATE_COUNT * MIN_WEEK_DATE_TARGET_SIZE +
    HOME_CONTENT_HORIZONTAL_PADDING * 2;

  expect(getWeekDatePickerLayout(fittingViewportWidth)).toEqual({
    isFullBleed: false,
    stripWidth: WEEK_DATE_COUNT * MIN_WEEK_DATE_TARGET_SIZE,
    horizontalMargin: 0,
    dayWidth: MIN_WEEK_DATE_TARGET_SIZE,
  });
});
