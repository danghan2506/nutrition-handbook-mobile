import { gentleHabitsIntro } from '../constants/onboarding';

describe('gentleHabitsIntro', () => {
  it('describes the approved second onboarding screen in Vietnamese', () => {
    expect(gentleHabitsIntro).toEqual({
      eyebrow: 'Những điều nhỏ mỗi ngày',
      title: 'Chăm mình từ những thói quen nhẹ nhàng',
      body: 'Ăn đúng bữa, uống đủ nước và nghỉ ngơi đúng lúc — từng điều nhỏ giúp bạn hiểu cơ thể hơn.',
      continueLabel: 'Tiếp tục',
      skipLabel: 'Bỏ qua',
      step: 2,
      activities: ['Ăn đúng bữa', 'Uống đủ nước', 'Nghỉ ngơi đúng lúc'],
    });
  });
});
