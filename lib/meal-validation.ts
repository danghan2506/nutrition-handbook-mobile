import { ACCEPTED_MEAL_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/constants/meals';
import type { CustomFoodInput, MealDraft, SelectedMealImage } from '@/types/meals';

export type MealFieldErrors = Record<string, string>;

export function validateCustomFoodInput(input: CustomFoodInput): MealFieldErrors {
  const errors: MealFieldErrors = {};
  if (!input.name.trim()) errors.name = 'Vui lòng nhập tên món ăn.';
  if (!input.servingName.trim()) errors.servingName = 'Vui lòng nhập tên khẩu phần.';
  if (!Number.isFinite(input.servingGrams) || input.servingGrams <= 0) {
    errors.servingGrams = 'Khối lượng khẩu phần phải lớn hơn 0.';
  }

  for (const [key, value] of Object.entries(input.nutritionPerServing)) {
    if (!Number.isFinite(value) || value < 0) errors[key] = 'Giá trị không được âm.';
  }

  return errors;
}

export function validateMealDraft(draft: MealDraft): MealFieldErrors {
  const errors: MealFieldErrors = {};
  if (!draft.mealType) errors.mealType = 'Vui lòng chọn loại bữa.';
  if (!draft.eatenAt) errors.eatenAt = 'Vui lòng chọn thời gian ăn.';
  if (draft.items.length === 0) errors.items = 'Hãy thêm ít nhất một món ăn.';
  return errors;
}

export function validateSelectedMealImage(image: SelectedMealImage): MealFieldErrors {
  const errors: MealFieldErrors = {};
  if (!image.uri) errors.uri = 'Không tìm thấy ảnh đã chọn.';
  if (!image.mimeType || !ACCEPTED_MEAL_IMAGE_TYPES.includes(image.mimeType as (typeof ACCEPTED_MEAL_IMAGE_TYPES)[number])) {
    errors.mimeType = 'Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.';
  }
  if (image.fileSize === null || !Number.isFinite(image.fileSize)) {
    errors.fileSize = 'Không đọc được kích thước ảnh.';
  } else if (image.fileSize > MAX_IMAGE_BYTES) {
    errors.fileSize = 'Ảnh vượt quá giới hạn 10 MB.';
  }
  return errors;
}
