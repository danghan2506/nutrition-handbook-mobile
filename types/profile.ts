export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'very_active';

export type ProfileStep = 0 | 1 | 2 | 3;

export type ProfileDraft = {
  name: string;
  age: string;
  weightKg: string;
  gender: Gender | null;
  heightCm: number;
  activityLevel: ActivityLevel | null;
};
