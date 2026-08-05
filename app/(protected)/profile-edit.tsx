import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityLevelSelect } from '@/components/profile/activity-level-select';
import { GenderSelect } from '@/components/profile/gender-select';
import { NutritionGoalSelect } from '@/components/profile/nutrition-goal-select';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from '@/components/ui/tw';
import {
  profileToForm,
  type PersonalProfileForm,
  type PersonalProfileFormErrors,
  validatePersonalProfileForm,
} from '@/lib/personal-profile-form';
import { usePersonalStore } from '@/store/use-personal-store';
import {
  biologicalSexToGender,
  genderToBiologicalSex,
} from '@/types/personal';

type TextFieldKey =
  | 'displayName'
  | 'dateOfBirth'
  | 'heightCm'
  | 'currentWeightKg';

export default function ProfileEditScreen() {
  const router = useRouter();
  const profile = usePersonalStore((state) => state.profile);
  const updateProfile = usePersonalStore((state) => state.updateProfile);
  const [draft, setDraft] = useState<PersonalProfileForm>(() =>
    profileToForm(profile),
  );
  const [errors, setErrors] = useState<PersonalProfileFormErrors>({});

  const updateTextField = (key: TextFieldKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSave = () => {
    const result = validatePersonalProfileForm(draft);
    setErrors(result.errors);

    if (!result.profile) return;

    updateProfile(result.profile);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-cloud" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12 pt-6"
        keyboardShouldPersistTaps="handled">
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
            Chỉnh sửa hồ sơ
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-soft-slate">
            Các thay đổi được giữ trong phiên sử dụng hiện tại.
          </Text>

          <Field
            error={errors.displayName}
            label="Tên"
            onChangeText={(value) => updateTextField('displayName', value)}
            value={draft.displayName}
          />
          <Field
            error={errors.dateOfBirth}
            label="Ngày sinh"
            onChangeText={(value) => updateTextField('dateOfBirth', value)}
            value={draft.dateOfBirth}
          />
          <View className="mt-5">
            <GenderSelect
              onChange={(gender) =>
                setDraft((current) => ({
                  ...current,
                  biologicalSex: genderToBiologicalSex(gender),
                }))
              }
              value={biologicalSexToGender(draft.biologicalSex)}
            />
          </View>
          <Field
            error={errors.heightCm}
            keyboardType="decimal-pad"
            label="Chiều cao (cm)"
            onChangeText={(value) => updateTextField('heightCm', value)}
            value={draft.heightCm}
          />
          <Field
            error={errors.currentWeightKg}
            keyboardType="decimal-pad"
            label="Cân nặng (kg)"
            onChangeText={(value) => updateTextField('currentWeightKg', value)}
            value={draft.currentWeightKg}
          />

          <Text className="mb-3 mt-7 text-[16px] font-extrabold text-ink-navy">
            Mức độ vận động
          </Text>
          <ActivityLevelSelect
            disabled={false}
            onChange={(activityLevel) =>
              setDraft((current) => ({ ...current, activityLevel }))
            }
            value={draft.activityLevel}
          />
          <Text className="mb-3 mt-5 text-[16px] font-extrabold text-ink-navy">
            Mục tiêu dinh dưỡng
          </Text>
          <NutritionGoalSelect
            disabled={false}
            onChange={(goalType) =>
              setDraft((current) => ({ ...current, goalType }))
            }
            value={draft.goalType}
          />

          <Pressable
            accessibilityLabel="Lưu thay đổi"
            accessibilityRole="button"
            className="mt-5 h-[52px] items-center justify-center rounded-[18px] bg-apricot"
            onPress={handleSave}>
            <Text className="text-[16px] font-extrabold text-surface">
              Lưu thay đổi
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'decimal-pad';
  error?: string;
}) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-[14px] font-bold text-ink-navy">{label}</Text>
      <TextInput
        accessibilityHint={error}
        accessibilityLabel={label}
        className={`h-[52px] rounded-[16px] border bg-surface px-4 text-[16px] text-ink-navy ${
          error ? 'border-coral-notice' : 'border-quiet-dot'
        }`}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        value={value}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-2 text-[13px] text-coral-notice">
          {error}
        </Text>
      ) : null}
    </View>
  );
}