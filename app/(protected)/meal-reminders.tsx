import { useRouter } from 'expo-router';
import React from 'react';
import { Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pressable, ScrollView, Text, View } from '@/components/ui/tw';
import { usePersonalStore } from '@/store/use-personal-store';

const labels = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Bữa phụ',
} as const;

export default function MealRemindersScreen() {
  const router = useRouter();
  const settings = usePersonalStore((state) => state.reminderSettings);
  const setRemindersEnabled = usePersonalStore(
    (state) => state.setRemindersEnabled,
  );
  const setMealReminderEnabled = usePersonalStore(
    (state) => state.setMealReminderEnabled,
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12 pt-6">
        <View className="mx-auto w-full max-w-[440px]">
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            className="min-h-11 justify-center"
            onPress={() => router.back()}>
            <Text className="text-[16px] font-bold text-ink-navy">‹ Quay lại</Text>
          </Pressable>
          <Text
            accessibilityRole="header"
            className="mt-4 font-rounded text-[30px] font-extrabold text-ink-navy">
            Nhắc bữa ăn
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-soft-slate">
            Các lựa chọn được giữ trong phiên sử dụng hiện tại.
          </Text>

          <View className="mt-7 rounded-[20px] bg-surface p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-bold text-ink-navy">
                Bật nhắc bữa ăn
              </Text>
              <Switch
                accessibilityLabel="Bật nhắc bữa ăn"
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#E7DDD3', true: '#FF9E7A' }}
                value={settings.enabled}
              />
            </View>

            {settings.reminders.map((reminder) => {
              const isActive = settings.enabled && reminder.enabled;
              return (
                <View
                  key={reminder.mealType}
                  className="mt-5 flex-row items-center border-t border-quiet-dot pt-5">
                  <View className="flex-1">
                    <Text className="text-[16px] font-bold text-ink-navy">
                      {labels[reminder.mealType]}
                    </Text>
                    <Text className="mt-1 text-[13px] text-soft-slate">
                      {reminder.localTime} · {isActive ? 'Đang bật' : 'Đang tắt'}
                    </Text>
                  </View>
                  <Switch
                    accessibilityLabel={`Nhắc ${labels[reminder.mealType]}`}
                    disabled={!settings.enabled}
                    onValueChange={(enabled) =>
                      setMealReminderEnabled(reminder.mealType, enabled)
                    }
                    trackColor={{ false: '#E7DDD3', true: '#FF9E7A' }}
                    value={isActive}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}