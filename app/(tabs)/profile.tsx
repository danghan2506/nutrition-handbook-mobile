import { type Href, useRouter } from 'expo-router';
import { Bell, ChevronRight, Settings } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pressable, ScrollView, Text, View } from '@/components/ui/tw';
import { usePersonalStore } from '@/store/use-personal-store';
import type { BiologicalSex } from '@/types/personal';
import type { GoalType } from '@/types/profile';

const goalLabels: Record<GoalType, string> = {
  HEALTHY_EATING: 'Ăn uống lành mạnh',
  WEIGHT_LOSS: 'Giảm cân',
  WEIGHT_MAINTENANCE: 'Duy trì cân nặng',
  WEIGHT_GAIN: 'Tăng cân',
  MUSCLE_GAIN: 'Tăng cơ',
};

const sexLabels: Record<BiologicalSex, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  PREFER_NOT_TO_SAY: 'Không muốn trả lời',
};

function formatBirthDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function getInitials(displayName: string) {
  const words = displayName.trim().split(/\s+/);
  return words
    .slice(-2)
    .map((word) => word.charAt(0).toLocaleUpperCase('vi-VN'))
    .join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const profile = usePersonalStore((state) => state.profile);
  const enabledCount = usePersonalStore((state) =>
    state.reminderSettings.enabled
      ? state.reminderSettings.reminders.filter((item) => item.enabled).length
      : 0,
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-28 pt-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View className="mx-auto w-full max-w-[440px]">
          <View className="flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="font-rounded text-[30px] font-extrabold text-ink-navy">
              Bạn
            </Text>
            <Pressable
              accessibilityLabel="Mở cài đặt"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-2xl bg-peach"
              onPress={() => router.push('/settings' as Href)}>
              <Settings color="#2F3542" size={21} />
            </Pressable>
          </View>

          <View className="mt-7 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-apricot">
              <Text className="font-rounded text-[28px] font-extrabold text-surface">
                {getInitials(profile.displayName)}
              </Text>
            </View>
            <Text className="mt-3 font-rounded text-[25px] font-extrabold text-ink-navy">
              {profile.displayName}
            </Text>
            <Text className="mt-1 text-[14px] text-soft-slate">
              {goalLabels[profile.goalType]}
            </Text>
          </View>

          <View className="mt-7 rounded-[20px] bg-surface p-5">
            <Text className="text-[13px] font-extrabold tracking-[1px] text-label-slate">
              THÔNG TIN CƠ BẢN
            </Text>
            <Text className="mt-3 text-[16px] font-bold text-ink-navy">
              {profile.heightCm} cm ·{' '}
              {profile.currentWeightKg} kg
            </Text>
            <Text className="mt-1 text-[14px] text-soft-slate">
              {sexLabels[profile.biologicalSex]} · Sinh ngày{' '}
              {formatBirthDate(profile.dateOfBirth)}
            </Text>
          </View>

          <Row
            label="Chỉnh sửa thông tin"
            onPress={() => router.push('/profile-edit' as Href)}
          />
          <Row
            detail={`${enabledCount} bữa đang bật`}
            icon={<Bell color="#2F3542" size={20} />}
            label="Nhắc ghi bữa ăn"
            onPress={() => router.push('/meal-reminders' as Href)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  detail,
  icon,
  onPress,
}: {
  label: string;
  detail?: string;
  icon?: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="min-h-16 flex-row items-center border-b border-quiet-dot"
      onPress={onPress}>
      {icon ? <View className="mr-3">{icon}</View> : null}
      <View className="flex-1">
        <Text className="text-[16px] font-bold text-ink-navy">{label}</Text>
        {detail ? (
          <Text className="mt-1 text-[13px] text-soft-slate">{detail}</Text>
        ) : null}
      </View>
      <ChevronRight color="#697386" size={20} />
    </Pressable>
  );
}
