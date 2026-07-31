import { getWeekDatePickerLayout } from '@/lib/week-date-picker-layout';

test('uses the viewport as a full-bleed strip on a 320px phone', () => {
  const layout = getWeekDatePickerLayout(320);

  expect(layout).toEqual({
    isFullBleed: true,
    stripWidth: 320,
    horizontalMargin: -20,
    dayWidth: 320 / 7,
  });
  expect(layout.dayWidth).toBeGreaterThanOrEqual(44);
});

test('keeps the normal 20px content alignment once seven targets fit', () => {
  expect(getWeekDatePickerLayout(348)).toEqual({
    isFullBleed: false,
    stripWidth: 308,
    horizontalMargin: 0,
    dayWidth: 44,
  });
});

test('uses the padded content width before reaching the shared cap', () => {
  const layout = getWeekDatePickerLayout(500);

  expect(layout.stripWidth).toBe(460);
  expect(layout.dayWidth).toBeCloseTo(460 / 7);
  expect(layout.horizontalMargin).toBe(0);
  expect(layout.isFullBleed).toBe(false);
});

test('caps a wide tablet strip at the shared 520px content width', () => {
  const layout = getWeekDatePickerLayout(1024);

  expect(layout.stripWidth).toBe(520);
  expect(layout.dayWidth).toBeCloseTo(520 / 7);
  expect(layout.horizontalMargin).toBe(0);
  expect(layout.isFullBleed).toBe(false);
});
