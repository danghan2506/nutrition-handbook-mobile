import {
  profileToForm,
  validatePersonalProfileForm,
} from '@/lib/personal-profile-form';
import { PERSONAL_PROFILE_MOCK } from '@/data/personal-mock';

describe('personal profile form', () => {
  it('keeps decimal measurements as editable strings', () => {
    const form = profileToForm(PERSONAL_PROFILE_MOCK);

    expect(form.heightCm).toBe('172');
    expect(form.currentWeightKg).toBe('68.5');

    form.currentWeightKg = '68,';
    expect(form.currentWeightKg).toBe('68,');
  });

  it('normalizes valid decimal input only when the form is submitted', () => {
    const result = validatePersonalProfileForm({
      ...profileToForm(PERSONAL_PROFILE_MOCK),
      heightCm: '172,5',
      currentWeightKg: '68.5',
    });

    expect(result.errors).toEqual({});
    expect(result.profile).toMatchObject({
      heightCm: 172.5,
      currentWeightKg: 68.5,
    });
  });

  it('rejects invalid health profile fields before saving', () => {
    const result = validatePersonalProfileForm({
      ...profileToForm(PERSONAL_PROFILE_MOCK),
      displayName: '   ',
      dateOfBirth: '2099-02-30',
      heightCm: '0',
      currentWeightKg: '-1',
    });

    expect(result.profile).toBeNull();
    expect(result.errors).toEqual({
      displayName: 'Vui lòng nhập tên của bạn.',
      dateOfBirth: 'Ngày sinh chưa hợp lệ.',
      heightCm: 'Chiều cao phải lớn hơn 0 cm.',
      currentWeightKg: 'Cân nặng phải lớn hơn 0 kg.',
    });
  });

  it('rejects non-decimal syntax and implausible measurement ranges', () => {
    const result = validatePersonalProfileForm({
      ...profileToForm(PERSONAL_PROFILE_MOCK),
      heightCm: '0x10',
      currentWeightKg: '1e100',
    });

    expect(result.profile).toBeNull();
    expect(result.errors.heightCm).toBe(
      'Chiều cao cần nằm trong khoảng 30–300 cm.',
    );
    expect(result.errors.currentWeightKg).toBe(
      'Cân nặng cần nằm trong khoảng 1–500 kg.',
    );
  });});
