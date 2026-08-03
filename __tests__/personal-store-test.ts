import { usePersonalStore } from '@/store/use-personal-store';

describe('personal session store', () => {
  beforeEach(() => {
    usePersonalStore.getState().reset();
  });

  it('shares saved profile changes with profile consumers', () => {
    usePersonalStore.getState().updateProfile({
      ...usePersonalStore.getState().profile,
      displayName: 'Trần Minh Anh',
      currentWeightKg: 67.8,
    });

    expect(usePersonalStore.getState().profile.displayName).toBe('Trần Minh Anh');
    expect(usePersonalStore.getState().profile.currentWeightKg).toBe(67.8);
  });

  it('keeps reminder choices in sync and respects the master switch', () => {
    const store = usePersonalStore.getState();

    expect(store.enabledReminderCount()).toBe(3);
    store.setRemindersEnabled(false);
    expect(usePersonalStore.getState().enabledReminderCount()).toBe(0);

    usePersonalStore.getState().setRemindersEnabled(true);
    usePersonalStore.getState().setMealReminderEnabled('SNACK', true);
    expect(usePersonalStore.getState().enabledReminderCount()).toBe(4);
  });

  it('clears in-memory health data when the authenticated user changes', () => {
    usePersonalStore.getState().syncSessionUser('user-a');
    usePersonalStore.getState().updateProfile({
      ...usePersonalStore.getState().profile,
      displayName: 'Dữ liệu riêng của A',
    });

    usePersonalStore.getState().syncSessionUser('user-b');

    expect(usePersonalStore.getState().profile.displayName).toBe('Nguyễn Văn An');
    expect(usePersonalStore.getState().sessionUserId).toBe('user-b');
  });});
