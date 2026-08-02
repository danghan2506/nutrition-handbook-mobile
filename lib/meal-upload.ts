import type { SelectedMealImage } from '@/types/meals';

export function buildMealImageFormData(image: SelectedMealImage, fields: Record<string, string> = {}): FormData {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  if (image.webFile) {
    formData.append('image', image.webFile);
  } else {
    formData.append('image', { uri: image.uri, name: image.fileName ?? 'meal-image.jpg', type: image.mimeType ?? 'image/jpeg' } as unknown as Blob);
  }
  return formData;
}
