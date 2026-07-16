export const ONBOARDING_SLIDE_COUNT = 3;

function clampSlideIndex(index: number): number {
  return Math.min(Math.max(index, 0), ONBOARDING_SLIDE_COUNT - 1);
}

export function getNextSlideIndex(currentIndex: number): number {
  return clampSlideIndex(currentIndex + 1);
}

export function getSlideIndexFromOffset(offsetX: number, pageWidth: number): number {
  if (pageWidth <= 0) {
    return 0;
  }

  return clampSlideIndex(Math.round(offsetX / pageWidth));
}
