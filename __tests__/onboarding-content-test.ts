import { mealTrackingIntro, vietnameseFoodAiIntro } from '../constants/onboarding';

describe('mealTrackingIntro', () => {
  it('describes the approved first onboarding screen in Vietnamese', () => {
    expect(mealTrackingIntro).toEqual({
      eyebrow: 'Nhìn lại bữa ăn mỗi ngày',
      title: 'Ghi lại bữa ăn trong ngày của bạn',
      body: 'Bữa sáng, trưa hay tối — ghi lại khi bạn muốn để hiểu điều gì giúp bạn thấy dễ chịu.',
      continueLabel: 'Tiếp tục',
      skipLabel: 'Bỏ qua',
      meals: ['Sáng', 'Trưa', 'Tối'],
    });
  });
});

describe('vietnameseFoodAiIntro', () => {
  it('describes the approved third onboarding screen in Vietnamese', () => {
    expect(vietnameseFoodAiIntro).toEqual({
      eyebrow: 'Hiểu món ăn quen thuộc',
      title: 'Khám phá dinh dưỡng trong món Việt',
      body: 'Chụp món ăn để AI hỗ trợ nhận diện và tra cứu dinh dưỡng. Bạn luôn có thể xem lại và chỉnh sửa trước khi lưu.',
      continueLabel: 'Bắt đầu',
      skipLabel: 'Bỏ qua',
      metrics: ['420 kcal', '26g đạm', '52g carb'],
      lookupLabel: 'AI tra cứu',
    });
  });
});
