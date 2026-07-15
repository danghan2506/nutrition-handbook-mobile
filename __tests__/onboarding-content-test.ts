import { mealTrackingIntro } from '../constants/onboarding';

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
