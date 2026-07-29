import {
  HEIGHT_TICK_SPACING,
  MAX_AGE,
  MAX_HEIGHT_CM,
  MAX_WEIGHT_KG,
  MIN_AGE,
  MIN_HEIGHT_CM,
  MIN_WEIGHT_KG,
  profileCopy,
} from '@/constants/profile';

type ValidationResult<T> = { value: T } | { error: string };

export function validateName(input: string): ValidationResult<string> {
  const value = input.trim();
  return value ? { value } : { error: profileCopy.nameRequired };
}

export function validateAge(input: string): ValidationResult<number> {
  if (!/^\d+$/.test(input)) {
    return { error: profileCopy.ageInteger };
  }

  const value = Number(input);
  if (value < MIN_AGE || value > MAX_AGE) {
    return { error: profileCopy.ageRange };
  }

  return { value };
}

export function validateWeight(input: string): ValidationResult<number> {
  if (!/^\d+$/.test(input)) {
    return { error: profileCopy.weightInteger };
  }

  const value = Number(input);
  if (value < MIN_WEIGHT_KG || value > MAX_WEIGHT_KG) {
    return { error: profileCopy.weightRange };
  }

  return { value };
}
export function clampHeight(value: number): number {
  return Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, value));
}

export function heightToOffset(heightCm: number): number {
  return (clampHeight(heightCm) - MIN_HEIGHT_CM) * HEIGHT_TICK_SPACING;
}

export function offsetToHeight(offset: number): number {
  return clampHeight(
    MIN_HEIGHT_CM + Math.round(offset / HEIGHT_TICK_SPACING),
  );
}

export type InteractionLock = {
  release: () => void;
  tryAcquire: () => boolean;
};

export function createInteractionLock(
  onChange: (isLocked: boolean) => void,
): InteractionLock {
  let isLocked = false;

  return {
    release() {
      if (!isLocked) {
        return;
      }

      isLocked = false;
      onChange(false);
    },
    tryAcquire() {
      if (isLocked) {
        return false;
      }

      isLocked = true;
      onChange(true);
      return true;
    },
  };
}
