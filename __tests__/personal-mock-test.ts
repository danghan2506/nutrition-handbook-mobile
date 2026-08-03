import {
  ACCOUNT_SUMMARY_MOCK,
  MEAL_REMINDER_SETTINGS_MOCK,
  PERSONAL_PROFILE_MOCK,
} from '@/data/personal-mock';
import {
  biologicalSexToGender,
  genderToBiologicalSex,
} from '@/types/personal';

it('provides complete mock data for every personal screen', () => {
  expect(PERSONAL_PROFILE_MOCK.displayName).toBeTruthy();
  expect(PERSONAL_PROFILE_MOCK.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(ACCOUNT_SUMMARY_MOCK.userId).toMatch(/^[\da-f-]{36}$/i);
  expect(ACCOUNT_SUMMARY_MOCK.linkedProviders).toEqual(['GOOGLE', 'PHONE']);
  expect(MEAL_REMINDER_SETTINGS_MOCK.reminders).toHaveLength(4);
  expect(new Set(MEAL_REMINDER_SETTINGS_MOCK.reminders.map(({ mealType }) => mealType)).size).toBe(4);
});

it('round-trips biological sex through existing onboarding selector values', () => {
  expect(biologicalSexToGender('MALE')).toBe('male');
  expect(genderToBiologicalSex('female')).toBe('FEMALE');
  expect(genderToBiologicalSex('prefer_not_to_say')).toBe('PREFER_NOT_TO_SAY');
});
