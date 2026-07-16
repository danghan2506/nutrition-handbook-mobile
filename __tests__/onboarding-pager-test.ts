import {
  getNextSlideIndex,
  getSlideIndexFromOffset,
  ONBOARDING_SLIDE_COUNT,
} from '../lib/onboarding-pager';

describe('onboarding pager', () => {
  it('advances without exceeding the final slide', () => {
    expect(getNextSlideIndex(0)).toBe(1);
    expect(getNextSlideIndex(1)).toBe(2);
    expect(getNextSlideIndex(2)).toBe(2);
  });

  it('settles offsets to a bounded slide index', () => {
    expect(getSlideIndexFromOffset(0, 390)).toBe(0);
    expect(getSlideIndexFromOffset(410, 390)).toBe(1);
    expect(getSlideIndexFromOffset(780, 390)).toBe(2);
    expect(getSlideIndexFromOffset(1200, 390)).toBe(2);
  });

  it('defines exactly three onboarding slides', () => {
    expect(ONBOARDING_SLIDE_COUNT).toBe(3);
  });
});
