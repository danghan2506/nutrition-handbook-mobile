import {
  getAssessmentLabel,
  getCalorieProgress,
  getCalorieTargetLabel,
  getCompletenessMessage,
} from '@/lib/dashboard-display';

test('uses only the explicit positive calorie maximum', () => {
  expect(getCalorieProgress(1850, { min: 1800, max: 2100 })).toBeCloseTo(1850 / 2100);
  expect(getCalorieProgress(2200, { max: 2100 })).toBe(1);
  expect(getCalorieProgress(1000, { min: 900 })).toBeNull();
  expect(getCalorieProgress(null, { max: 2100 })).toBeNull();
});

test('turns completeness into supportive copy instead of a percentage', () => {
  expect(getCompletenessMessage(0.86)).toBe('Một số món chưa có đủ dữ liệu dinh dưỡng.');
  expect(getCompletenessMessage(0.96)).toBeNull();
});

test('labels supplied calorie targets without inventing an upper bound', () => {
  expect(getCalorieTargetLabel({ min: 1800, max: 2100 })).toBe('Mục tiêu 1800–2100 kcal');
  expect(getCalorieTargetLabel({ max: 2100 })).toBe('Mục tiêu tối đa 2100 kcal');
  expect(getCalorieTargetLabel({ min: 900 })).toBe('Mục tiêu từ 900 kcal');
  expect(getCalorieTargetLabel()).toBe('Chưa có mục tiêu calo');
});
test('maps assessment status without calculating a score', () => {
  expect(getAssessmentLabel('PENDING', null)).toBe('Đang cập nhật điểm');
  expect(getAssessmentLabel('FAILED', null)).toBe('Chưa thể cập nhật điểm');
  expect(getAssessmentLabel('READY', 74)).toBe('Điểm 74');
});
