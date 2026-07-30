import type {
  ActivityLevel,
  Gender,
  GoalType,
  ProfileDraft,
} from '@/types/profile';

export const PROFILE_STEP_COUNT = 5;
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
  goalType: null,
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

export const NUTRITION_GOAL_OPTIONS: ReadonlyArray<{
  value: GoalType;
  label: string;
  description: string;
}> = [
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
  goalKicker: 'MỤC TIÊU DINH DƯỠNG',
  goalTitle: 'Bạn muốn tập trung vào điều gì nhất?',
  goalBody: 'Chọn một mục tiêu chính phù hợp với bạn lúc này.',
  goalRequired: 'Vui lòng chọn mục tiêu dinh dưỡng của bạn.',
  nameRequired: 'Vui lòng nhập tên của bạn.',
  ageInteger: 'Vui lòng nhập tuổi bằng số nguyên.',
  ageRange: 'Tuổi cần nằm trong khoảng 5–120.',
  weightInteger: 'Vui lòng nhập cân nặng bằng số nguyên.',
  weightRange: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
  genderRequired: 'Vui lòng chọn giới tính.',
} as const;
