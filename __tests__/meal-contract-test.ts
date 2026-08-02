import { MAX_IMAGE_BYTES } from '@/constants/meals';
import { validateCustomFoodInput, validateSelectedMealImage } from '@/lib/meal-validation';

describe('meal contracts and validation', () => {
  it('requires serving data and non-negative nutrients', () => {
    expect(
      validateCustomFoodInput({
        name: ' ',
        servingName: '',
        servingGrams: 0,
        nutritionPerServing: {
          caloriesKcal: -1,
          proteinG: 0,
          carbohydrateG: 0,
          fatG: 0,
          fiberG: 0,
          sugarG: 0,
          sodiumMg: 0,
        },
      }),
    ).toMatchObject({
      name: expect.any(String),
      servingName: expect.any(String),
      servingGrams: expect.any(String),
      caloriesKcal: expect.any(String),
    });
  });

  it('accepts documented image MIME types at the configured size limit', () => {
    expect(
      validateSelectedMealImage({
        uri: 'file:///meal.jpg',
        fileName: 'meal.jpg',
        mimeType: 'image/jpeg',
        fileSize: MAX_IMAGE_BYTES,
      }),
    ).toEqual({});
  });

  it('rejects unsupported image MIME types', () => {
    expect(
      validateSelectedMealImage({
        uri: 'file:///meal.heic',
        fileName: 'meal.heic',
        mimeType: 'image/heic',
        fileSize: 100,
      }),
    ).toHaveProperty('mimeType');
  });
});
