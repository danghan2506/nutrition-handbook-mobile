import type { ActivityLevel, Gender, GoalType } from '@/types/profile';

export type BiologicalSex = 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY';

export type PersonalProfile = {
  displayName: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
};

export type AccountSummary = {
  userId: string;
  email: string | null;
  phone: string | null;
  linkedProviders: readonly ('GOOGLE' | 'PHONE' | 'FACEBOOK')[];
  accountStatus: 'ACTIVE' | 'DISABLED';
};

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export type MealReminder = {
  mealType: MealType;
  localTime: string;
  enabled: boolean;
};

export type MealReminderSettings = {
  enabled: boolean;
  timezone: string;
  reminders: readonly MealReminder[];
};

export function biologicalSexToGender(value: BiologicalSex): Gender {
  if (value === 'MALE') return 'male';
  if (value === 'FEMALE') return 'female';
  return 'prefer_not_to_say';
}

export function genderToBiologicalSex(value: Gender): BiologicalSex {
  if (value === 'male') return 'MALE';
  if (value === 'female') return 'FEMALE';
  return 'PREFER_NOT_TO_SAY';
}
