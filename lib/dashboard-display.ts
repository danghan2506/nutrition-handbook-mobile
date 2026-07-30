import type { AssessmentStatus, NumericTarget } from '@/types/dashboard';

export function getCalorieProgress(
  calories: number | null,
  target?: NumericTarget,
): number | null {
  if (calories === null || !target?.max || target.max <= 0) return null;

  return Math.min(Math.max(calories / target.max, 0), 1);
}

export function getCompletenessMessage(value: number): string | null {
  return value < 0.9 ? 'Một số món chưa có đủ dữ liệu dinh dưỡng.' : null;
}

export function getAssessmentLabel(
  status: AssessmentStatus,
  score: number | null,
): string {
  if (status === 'PENDING') return 'Đang cập nhật điểm';
  if (status === 'FAILED') return 'Chưa thể cập nhật điểm';

  return score === null ? 'Điểm chưa có' : `Điểm ${score}`;
}
