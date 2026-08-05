import { type Href, useRouter } from 'expo-router';
import {
  Activity,
  Bell,
  ChevronRight,
  Ruler,
  Scale,
  Settings,
  Sparkles,
  UserPen,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from '@/components/ui/tw';
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

export function calculateBMI(
  weightKg?: number,
  heightCm?: number,
): { bmi: string; label: string } | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmiVal = weightKg / (heightM * heightM);
  const bmiFormatted = bmiVal.toFixed(1);

  let label = 'Cân đối';
  if (bmiVal < 18.5) {
    label = 'Gầy nhẹ';
  } else if (bmiVal >= 25) {
    label = 'Đầy đặn';
  }

  return { bmi: bmiFormatted, label };
}

function formatBirthDate(date?: string) {
  if (!date || !date.includes('-')) return date || 'Chưa cập nhật';
  const parts = date.split('-');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return date;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function getInitials(displayName?: string) {
  if (!displayName || !displayName.trim()) return 'U';
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
    state.reminderSettings?.enabled
      ? state.reminderSettings.reminders.filter((item) => item.enabled).length
      : 0,
  );

  const displayName = profile?.displayName || 'Người dùng';
  const heightCm = profile?.heightCm ?? '--';
  const currentWeightKg = profile?.currentWeightKg ?? '--';
  const goalText =
    (profile?.goalType && goalLabels[profile.goalType]) || 'Chưa chọn mục tiêu';
  const sexText =
    (profile?.biologicalSex && sexLabels[profile.biologicalSex]) ||
    'Chưa cập nhật';
  const birthDateText = formatBirthDate(profile?.dateOfBirth);

  const bmi = calculateBMI(profile?.currentWeightKg, profile?.heightCm);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-cloud" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-28 pt-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View className="mx-auto w-full max-w-[440px]">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="font-rounded text-[30px] font-extrabold text-ink-navy">
              Bạn
            </Text>
            <Pressable
              accessibilityLabel="Mở cài đặt"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-2xl bg-peach active:opacity-80"
              onPress={() => router.push('/settings' as Href)}>
              <Settings color="#2F3542" size={21} />
            </Pressable>
          </View>

          {/* Hero User Section */}
          <View className="mt-7 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-apricot ring-4 ring-peach">
              <Text className="font-rounded text-[28px] font-extrabold text-surface">
                {getInitials(displayName)}
              </Text>
            </View>
            <Text className="mt-3 font-rounded text-[25px] font-extrabold text-ink-navy">
              {displayName}
            </Text>
            <View className="mt-2 self-center rounded-full bg-peach/60 px-3 py-1">
              <Text className="text-[13px] font-semibold text-ink-navy">
                {goalText}
              </Text>
            </View>
          </View>

          {/* Health Stat Card (Pro Max v2) */}
          <View className="mt-7">
            {/* 2 Hero Metric Cards side-by-side */}
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-[20px] bg-peach p-4">
                <View className="flex-row items-center gap-2">
                  <Scale color="#2F3542" size={18} />
                  <Text className="text-[13px] font-semibold text-soft-slate">
                    Cân nặng
                  </Text>
                </View>
                <Text className="mt-2 font-rounded text-[22px] font-extrabold text-ink-navy">
                  {currentWeightKg}
                  {typeof currentWeightKg === 'number' ? ' ' : ''}
                  <Text className="text-[14px] font-semibold text-soft-slate">
                    kg
                  </Text>
                </Text>
              </View>

              <View className="flex-1 rounded-[20px] bg-peach p-4">
                <View className="flex-row items-center gap-2">
                  <Ruler color="#2F3542" size={18} />
                  <Text className="text-[13px] font-semibold text-soft-slate">
                    Chiều cao
                  </Text>
                </View>
                <Text className="mt-2 font-rounded text-[22px] font-extrabold text-ink-navy">
                  {heightCm}
                  {typeof heightCm === 'number' ? ' ' : ''}
                  <Text className="text-[14px] font-semibold text-soft-slate">
                    cm
                  </Text>
                </Text>
              </View>
            </View>

            {/* BMI Status Chip */}
            {bmi ? (
              <View className="mt-3 flex-row items-center gap-1.5 self-start rounded-full bg-[#EAF0ED] px-3 py-1.5">
                <Activity color="#3B7A57" size={15} />
                <Text className="text-[13px] font-bold text-[#3B7A57]">
                  BMI {bmi.bmi} · {bmi.label}
                </Text>
              </View>
            ) : null}

            {/* 2 Pill Meta Cards below */}
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-2xl bg-surface p-3">
                <Text className="text-[12px] font-medium text-soft-slate">
                  Giới tính
                </Text>
                <Text className="mt-0.5 text-[15px] font-bold text-ink-navy">
                  {sexText}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-surface p-3">
                <Text className="text-[12px] font-medium text-soft-slate">
                  Ngày sinh
                </Text>
                <Text className="mt-0.5 text-[15px] font-bold text-ink-navy">
                  {birthDateText}
                </Text>
              </View>
            </View>
          </View>

          {/* Grouped Menu Card */}
          <View className="mt-6 rounded-[20px] bg-surface p-2">
            <MenuRow
              icon={<UserPen color="#2F3542" size={20} />}
              label="Chỉnh sửa thông tin cá nhân"
              onPress={() => router.push('/profile-edit' as Href)}
            />
            <MenuRow
              detail={`${enabledCount} bữa đang bật`}
              icon={<Bell color="#2F3542" size={20} />}
              label="Nhắc ghi bữa ăn"
              onPress={() => router.push('/meal-reminders' as Href)}
            />
            <MenuRow
              icon={<Settings color="#2F3542" size={20} />}
              isLast
              label="Cài đặt & Bảo mật"
              onPress={() => router.push('/settings' as Href)}
            />
          </View>

          {/* Caring Health Companion Banner */}
          <View className="mt-6 flex-row items-center gap-3 rounded-[20px] bg-peach/40 p-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-peach">
              <Sparkles color="#FF8B78" size={18} />
            </View>
            <Text className="flex-1 text-[14px] font-medium leading-5 text-ink-navy">
              Lắng nghe cơ thể và duy trì nhịp sống nhẹ nhàng hôm nay nhé,{' '}
              {displayName}!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  label,
  detail,
  icon,
  onPress,
  isLast = false,
}: {
  label: string;
  detail?: string;
  icon: ReactNode;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={`flex-row items-center px-3 py-3.5 active:scale-[0.98] active:opacity-80 ${
        isLast ? '' : 'border-b border-quiet-dot'
      }`}
      onPress={onPress}>
      <View className="mr-3.5 h-10 w-10 items-center justify-center rounded-xl bg-peach/50">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-ink-navy">{label}</Text>
        {detail ? (
          <Text className="mt-0.5 text-[13px] text-soft-slate">{detail}</Text>
        ) : null}
      </View>
      <ChevronRight color="#697386" size={18} />
    </Pressable>
  );
}

