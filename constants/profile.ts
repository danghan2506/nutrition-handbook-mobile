import type { ActivityLevel, Gender, ProfileDraft } from '@/types/profile';

export const PROFILE_STEP_COUNT = 4;
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
  activityLevel: null,
};

export const GENDER_OPTIONS: ReadonlyArray<{ label: string; value: Gender }> = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Không muốn trả lời', value: 'prefer_not_to_say' },
];

export const ACTIVITY_LEVEL_OPTIONS: ReadonlyArray<{
  value: ActivityLevel;
  label: string;
  details: readonly string[];
}> = [
  {
    value: 'sedentary',
    label: 'Không tập luyện',
    details: [
      'Đi bộ dưới 3.000 bước/ngày.',
      'Ngồi nhiều, ít di chuyển (nhân viên văn phòng, học sinh, sinh viên).',
      'Không tập thể dục hoặc tập dưới 15 phút/ngày.',
    ],
  },
  {
    value: 'light',
    label: 'Vận động nhẹ nhàng',
    details: [
      'Đi bộ 3.000–7.000 bước/ngày.',
      'Công việc cần đi lại hoặc đứng nhiều hơn (giáo viên, nhân viên bán hàng, phục vụ).',
      'Tập nhẹ 2–3 buổi/tuần, 30–45 phút/buổi.',
      'Thường xuyên leo cầu thang hoặc làm việc nhà cơ bản.',
    ],
  },
  {
    value: 'active',
    label: 'Chăm chỉ luyện tập',
    details: [
      'Đi bộ 7.000–10.000 bước/ngày.',
      'Công việc di chuyển thường xuyên (phục vụ, nhân viên kho, công nhân dây chuyền, làm vườn).',
      'Tập đều 3–5 buổi/tuần, ít nhất 45 phút/buổi.',
    ],
  },
  {
    value: 'very_active',
    label: 'Rất năng động',
    details: [
      'Đi bộ từ 10.000 bước/ngày.',
      'Công việc đòi hỏi nhiều thể lực (khuân vác, thợ xây).',
      'Tập nghiêm túc 5–6 buổi/tuần, ít nhất 60 phút/buổi (tập tạ, chạy đường dài, thể thao đối kháng).',
    ],
  },
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
  activityKicker: 'MỨC ĐỘ HOẠT ĐỘNG',
  activityTitle: 'Một tuần của bạn thường năng động thế nào?',
  activityBody: 'Chọn mức gần với nhịp sinh hoạt thông thường của bạn nhất.',
  activityNote: 'Bạn không cần khớp hoàn toàn với mọi ví dụ.',
  activityRequired: 'Vui lòng chọn mức độ hoạt động của bạn.',
  nameRequired: 'Vui lòng nhập tên của bạn.',
  ageInteger: 'Vui lòng nhập tuổi bằng số nguyên.',
  ageRange: 'Tuổi cần nằm trong khoảng 5–120.',
  weightInteger: 'Vui lòng nhập cân nặng bằng số nguyên.',
  weightRange: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
  genderRequired: 'Vui lòng chọn giới tính.',
} as const;
