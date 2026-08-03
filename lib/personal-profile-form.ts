import type { PersonalProfile } from '@/types/personal';

export type PersonalProfileForm = Omit<
  PersonalProfile,
  'heightCm' | 'currentWeightKg'
> & {
  heightCm: string;
  currentWeightKg: string;
};

export type PersonalProfileFormErrors = Partial<
  Record<'displayName' | 'dateOfBirth' | 'heightCm' | 'currentWeightKg', string>
>;

export type PersonalProfileValidationResult = {
  errors: PersonalProfileFormErrors;
  profile: PersonalProfile | null;
};

export function profileToForm(profile: PersonalProfile): PersonalProfileForm {
  return {
    ...profile,
    heightCm: String(profile.heightCm),
    currentWeightKg: String(profile.currentWeightKg),
  };
}

function parseMeasurement(
  value: string,
  minimum: number,
  maximum: number,
  positiveError: string,
  rangeError: string,
) {
  const normalized = value.trim().replace(',', '.');
  const numeric = Number(normalized);

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return {
      error: Number.isFinite(numeric) && numeric <= 0 ? positiveError : rangeError,
      value: null,
    };
  }
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { error: positiveError, value: null };
  }
  if (numeric < minimum || numeric > maximum) {
    return { error: rangeError, value: null };
  }

  return { error: null, value: numeric };
}

function isValidPastOrPresentIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900) return false;

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getTime() <= today.getTime()
  );
}

export function validatePersonalProfileForm(
  form: PersonalProfileForm,
): PersonalProfileValidationResult {
  const errors: PersonalProfileFormErrors = {};
  const height = parseMeasurement(
    form.heightCm,
    30,
    300,
    'Chiều cao phải lớn hơn 0 cm.',
    'Chiều cao cần nằm trong khoảng 30–300 cm.',
  );
  const weight = parseMeasurement(
    form.currentWeightKg,
    1,
    500,
    'Cân nặng phải lớn hơn 0 kg.',
    'Cân nặng cần nằm trong khoảng 1–500 kg.',
  );

  if (!form.displayName.trim()) {
    errors.displayName = 'Vui lòng nhập tên của bạn.';
  }
  if (!isValidPastOrPresentIsoDate(form.dateOfBirth)) {
    errors.dateOfBirth = 'Ngày sinh chưa hợp lệ.';
  }
  if (height.error) {
    errors.heightCm = height.error;
  }
  if (weight.error) {
    errors.currentWeightKg = weight.error;
  }

  if (
    Object.keys(errors).length > 0 ||
    height.value === null ||
    weight.value === null
  ) {
    return { errors, profile: null };
  }

  return {
    errors,
    profile: {
      ...form,
      displayName: form.displayName.trim(),
      heightCm: height.value,
      currentWeightKg: weight.value,
    },
  };
}