import {
  clampHeight,
  heightToOffset,
  offsetToHeight,
  validateAge,
  validateName,
  validateWeight,
} from '@/lib/profile-setup';
import {
  ACTIVITY_LEVEL_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  PROFILE_DEFAULTS,
  PROFILE_STEP_COUNT,
} from '@/constants/profile';

describe('profile setup logic', () => {
  it('defines the activity and nutrition-goal profile steps', () => {
    expect(PROFILE_STEP_COUNT).toBe(5);
    expect(PROFILE_DEFAULTS.activityLevel).toBeNull();
    expect(PROFILE_DEFAULTS.goalType).toBeNull();
    expect(ACTIVITY_LEVEL_OPTIONS.map((option) => option.value)).toEqual([
      'sedentary',
      'light',
      'active',
      'very_active',
    ]);
    expect(
      ACTIVITY_LEVEL_OPTIONS.every((option) => option.details.length >= 3),
    ).toBe(true);
    expect(NUTRITION_GOAL_OPTIONS).toEqual([
      {
        value: 'HEALTHY_EATING',
        label: 'Ăn uống lành mạnh',
        description:
          'Xây dựng những lựa chọn cân bằng và phù hợp hơn mỗi ngày.',
      },
      {
        value: 'WEIGHT_LOSS',
        label: 'Giảm cân',
        description:
          'Hướng đến giảm cân từ từ với thói quen ăn uống bền vững.',
      },
      {
        value: 'WEIGHT_MAINTENANCE',
        label: 'Duy trì cân nặng',
        description:
          'Giữ cân nặng ổn định và duy trì nhịp sống hiện tại.',
      },
      {
        value: 'WEIGHT_GAIN',
        label: 'Tăng cân',
        description:
          'Tăng cân có chủ đích với nguồn dinh dưỡng phù hợp.',
      },
      {
        value: 'MUSCLE_GAIN',
        label: 'Tăng cường cơ bắp',
        description:
          'Hỗ trợ phát triển cơ bắp bằng dinh dưỡng và vận động.',
      },
    ]);
  });

  it('trims names and rejects an empty result', () => {
    expect(validateName('  Linh  ')).toEqual({ value: 'Linh' });
    expect(validateName('   ')).toEqual({ error: 'Vui lòng nhập tên của bạn.' });
  });

  it('accepts only whole-number ages from 5 through 120', () => {
    expect(validateAge('5')).toEqual({ value: 5 });
    expect(validateAge('120')).toEqual({ value: 120 });
    expect(validateAge('4')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('121')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('24.5')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
    expect(validateAge('abc')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
  });

  it('accepts whole-number weights from 20 through 300', () => {
    expect(validateWeight('20')).toEqual({ value: 20 });
    expect(validateWeight('300')).toEqual({ value: 300 });
    expect(validateWeight('19')).toEqual({
      error: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
    });
    expect(validateWeight('301')).toEqual({
      error: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
    });
    expect(validateWeight('')).toEqual({
      error: 'Vui lòng nhập cân nặng bằng số nguyên.',
    });
    expect(validateWeight('65.5')).toEqual({
      error: 'Vui lòng nhập cân nặng bằng số nguyên.',
    });
    expect(validateWeight('abc')).toEqual({
      error: 'Vui lòng nhập cân nặng bằng số nguyên.',
    });
  });
  it('clamps and converts ruler values at a 12 px tick interval', () => {
    expect(clampHeight(99)).toBe(100);
    expect(clampHeight(165)).toBe(165);
    expect(clampHeight(221)).toBe(220);
    expect(heightToOffset(100)).toBe(0);
    expect(heightToOffset(165)).toBe(780);
    expect(offsetToHeight(0)).toBe(100);
    expect(offsetToHeight(780)).toBe(165);
    expect(offsetToHeight(2000)).toBe(220);
  });

  it('rejects a second action until the interaction lock is released', () => {
    type TestInteractionLock = {
      release: () => void;
      tryAcquire: () => boolean;
    };
    type TestInteractionLockFactory = (
      onChange: (isLocked: boolean) => void,
    ) => TestInteractionLock;

    const profileSetup = jest.requireActual('@/lib/profile-setup') as object;
    const createInteractionLock = Reflect.get(
      profileSetup,
      'createInteractionLock',
    ) as TestInteractionLockFactory | undefined;

    expect(createInteractionLock).toBeDefined();
    if (!createInteractionLock) {
      return;
    }

    const stateChanges: boolean[] = [];
    const lock = createInteractionLock((isLocked) => {
      stateChanges.push(isLocked);
    });

    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);
    expect(stateChanges).toEqual([true]);

    lock.release();
    expect(stateChanges).toEqual([true, false]);
    expect(lock.tryAcquire()).toBe(true);
  });
});
