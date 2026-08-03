import type {
  AccountSummary,
  MealReminderSettings,
  PersonalProfile,
} from '@/types/personal';

export const PERSONAL_PROFILE_MOCK: PersonalProfile = {
  displayName: 'Nguyễn Văn An',
  dateOfBirth: '2002-05-18',
  biologicalSex: 'MALE',
  heightCm: 172,
  currentWeightKg: 68.5,
  activityLevel: 'active',
  goalType: 'WEIGHT_MAINTENANCE',
};

export const ACCOUNT_SUMMARY_MOCK: AccountSummary = {
  userId: 'a849f95f-7088-4ea7-a495-f86f37890c84',
  email: 'user@example.com',
  phone: '+84901234567',
  linkedProviders: ['GOOGLE', 'PHONE'],
  accountStatus: 'ACTIVE',
};

export const MEAL_REMINDER_SETTINGS_MOCK: MealReminderSettings = {
  enabled: true,
  timezone: 'Asia/Ho_Chi_Minh',
  reminders: [
    { mealType: 'BREAKFAST', localTime: '07:30', enabled: true },
    { mealType: 'LUNCH', localTime: '11:45', enabled: true },
    { mealType: 'DINNER', localTime: '18:30', enabled: true },
    { mealType: 'SNACK', localTime: '15:30', enabled: false },
  ],
};
