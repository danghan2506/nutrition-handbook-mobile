export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type ProfileStep = 0 | 1 | 2;

export type ProfileDraft = {
  name: string;
  age: string;
  weightKg: string;
  gender: Gender | null;
  heightCm: number;
};
