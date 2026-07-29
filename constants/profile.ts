import type { Gender, ProfileDraft } from '@/types/profile';

export const PROFILE_STEP_COUNT = 3;
export const MIN_AGE = 5;
export const MAX_AGE = 120;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 220;
export const DEFAULT_HEIGHT_CM = 165;
export const HEIGHT_TICK_SPACING = 12;

export const PROFILE_DEFAULTS: ProfileDraft = {
  name: '',
  age: '',
  weightKg: '',
  gender: null,
  heightCm: DEFAULT_HEIGHT_CM,
};

export const GENDER_OPTIONS: ReadonlyArray<{ label: string; value: Gender }> = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Không muốn trả lời', value: 'prefer_not_to_say' },
];

export const profileCopy = {
  back: 'Quay lại',
  continue: 'Tiếp tục',
  finish: 'Hoàn tất',
  nameKicker: 'THÔNG TIN CÁ NHÂN',
  nameTitle: 'Mình nên gọi bạn là gì?',
  nameLabel: 'Tên',
  namePlaceholder: 'Tên của bạn',
  basicsKicker: 'THÔNG TIN CƠ BẢN',
  basicsTitle: 'Một chút về bạn',
  basicsBody: 'Thông tin này giúp AURALE điều chỉnh trải nghiệm phù hợp hơn với bạn.',
  ageLabel: 'Tuổi',
  weightLabel: 'Cân nặng',
  genderLabel: 'Giới tính',
  genderPlaceholder: 'Chọn giới tính',
  heightKicker: 'CHIỀU CAO',
  heightTitle: 'Bạn cao bao nhiêu?',
  heightBody: 'Lướt thanh thước để chọn số đo phù hợp với bạn.',
  nameRequired: 'Vui lòng nhập tên của bạn.',
  ageInteger: 'Vui lòng nhập tuổi bằng số nguyên.',
  ageRange: 'Tuổi cần nằm trong khoảng 5–120.',
  weightInteger: 'Vui lòng nhập cân nặng bằng số nguyên.',
  weightRange: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
  genderRequired: 'Vui lòng chọn giới tính.',
} as const;
