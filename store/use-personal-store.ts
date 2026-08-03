import { create } from 'zustand';

import {
  MEAL_REMINDER_SETTINGS_MOCK,
  PERSONAL_PROFILE_MOCK,
} from '@/data/personal-mock';
import type {
  MealReminderSettings,
  MealType,
  PersonalProfile,
} from '@/types/personal';

type PersonalState = {
  sessionUserId: string | null;
  profile: PersonalProfile;
  reminderSettings: MealReminderSettings;
  updateProfile: (profile: PersonalProfile) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setMealReminderEnabled: (mealType: MealType, enabled: boolean) => void;
  enabledReminderCount: () => number;
  syncSessionUser: (userId: string | null) => void;
  reset: () => void;
};

function createInitialData(sessionUserId: string | null = null) {
  return {
    sessionUserId,
    profile: { ...PERSONAL_PROFILE_MOCK },
    reminderSettings: {
      ...MEAL_REMINDER_SETTINGS_MOCK,
      reminders: MEAL_REMINDER_SETTINGS_MOCK.reminders.map((item) => ({
        ...item,
      })),
    },
  };
}

export const usePersonalStore = create<PersonalState>((set, get) => ({
  ...createInitialData(),
  updateProfile: (profile) => set({ profile }),
  setRemindersEnabled: (enabled) =>
    set((state) => ({
      reminderSettings: { ...state.reminderSettings, enabled },
    })),
  setMealReminderEnabled: (mealType, enabled) =>
    set((state) => ({
      reminderSettings: {
        ...state.reminderSettings,
        reminders: state.reminderSettings.reminders.map((item) =>
          item.mealType === mealType ? { ...item, enabled } : item,
        ),
      },
    })),
  enabledReminderCount: () => {
    const settings = get().reminderSettings;
    return settings.enabled
      ? settings.reminders.filter((item) => item.enabled).length
      : 0;
  },
  syncSessionUser: (userId) => {
    if (get().sessionUserId !== userId) {
      set(createInitialData(userId));
    }
  },
  reset: () => set(createInitialData()),
}));
