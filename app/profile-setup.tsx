import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GenderSelect } from '@/components/profile/gender-select';
import { HeightRuler } from '@/components/profile/height-ruler';
import { ProfileProgress } from '@/components/profile/profile-progress';
import { PROFILE_DEFAULTS, profileCopy } from '@/constants/profile';
import { validateAge, validateName } from '@/lib/profile-setup';
import type { ProfileDraft, ProfileStep } from '@/types/profile';

type Errors = Partial<Record<'name' | 'age' | 'gender', string>>;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { fontScale, width } = useWindowDimensions();
  const stackBasics = width < 360 || fontScale >= 1.5;
  const [step, setStep] = useState<ProfileStep>(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [draft, setDraft] = useState<ProfileDraft>(PROFILE_DEFAULTS);
  const [errors, setErrors] = useState<Errors>({});
  const transitionPendingRef = useRef(false);
  const nameInputRef = useRef<TextInput>(null);
  const ageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `Màn ${step + 1} trên 3`,
    );
    if (step === 0) {
      nameInputRef.current?.focus();
    }
    if (step === 1) {
      ageInputRef.current?.focus();
    }
  }, [step]);

  const changeStep = (nextStep: ProfileStep, nextDirection: 'forward' | 'back') => {
    if (transitionPendingRef.current) {
      return;
    }
    transitionPendingRef.current = true;
    setDirection(nextDirection);
    setStep(nextStep);
    setTimeout(() => {
      transitionPendingRef.current = false;
    }, reduceMotion ? 0 : 240);
  };

  const continueFromName = () => {
    const result = validateName(draft.name);
    if ('error' in result) {
      setErrors({ name: result.error });
      return;
    }
    setDraft((current) => ({ ...current, name: result.value }));
    setErrors({});
    changeStep(1, 'forward');
  };

  const continueFromBasics = () => {
    const ageResult = validateAge(draft.age);
    const nextErrors: Errors = {};
    if ('error' in ageResult) {
      nextErrors.age = ageResult.error;
    }
    if (!draft.gender) {
      nextErrors.gender = profileCopy.genderRequired;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    changeStep(2, 'forward');
  };

  const finish = () => {
    const nameResult = validateName(draft.name);
    const ageResult = validateAge(draft.age);
    if ('error' in nameResult) {
      setErrors({ name: nameResult.error });
      changeStep(0, 'back');
      return;
    }
    if ('error' in ageResult || !draft.gender) {
      setErrors({
        age: 'error' in ageResult ? ageResult.error : undefined,
        gender: draft.gender ? undefined : profileCopy.genderRequired,
      });
      changeStep(1, 'back');
      return;
    }

    // Persistence is intentionally deferred until a storage design is approved.
    router.replace('/(tabs)');
  };

  const entering = reduceMotion
    ? FadeIn.duration(160)
    : direction === 'forward'
      ? FadeInRight.duration(220)
      : FadeInLeft.duration(220);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-[520px] flex-1 self-center px-5 pb-6 pt-3">
            <ProfileProgress
              onBack={() => changeStep((step - 1) as ProfileStep, 'back')}
              step={step}
            />

            <Animated.View key={step} entering={entering} className="flex-1">
              {step === 0 ? (
                <>
                  <Text className="text-[12px] font-extrabold tracking-[1px] text-label-slate">
                    {profileCopy.nameKicker}
                  </Text>
                  <Text className="mt-2 font-rounded text-[31px] font-extrabold leading-[37px] text-ink-navy">
                    {profileCopy.nameTitle}
                  </Text>
                  <Text className="mb-2 mt-8 text-[14px] font-bold text-ink-navy">
                    {profileCopy.nameLabel}
                  </Text>
                  <TextInput
                    ref={nameInputRef}
                    accessibilityLabel={profileCopy.nameLabel}
                    autoCapitalize="words"
                    className={`h-[57px] rounded-[17px] border bg-surface px-4 text-[16px] text-ink-navy ${
                      errors.name ? 'border-coral-notice' : 'border-quiet-dot'
                    }`}
                    onChangeText={(name) => {
                      setDraft((current) => ({ ...current, name }));
                      setErrors((current) => ({ ...current, name: undefined }));
                    }}
                    placeholder={profileCopy.namePlaceholder}
                    placeholderTextColor="#697386"
                    value={draft.name}
                  />
                  {errors.name ? (
                    <Text accessibilityLiveRegion="polite" className="mt-2 text-[13px] text-coral-notice">
                      {errors.name}
                    </Text>
                  ) : null}
                  <PrimaryAction label={profileCopy.continue} onPress={continueFromName} />
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <Text className="text-[12px] font-extrabold tracking-[1px] text-label-slate">
                    {profileCopy.basicsKicker}
                  </Text>
                  <Text className="mt-2 font-rounded text-[31px] font-extrabold leading-[37px] text-ink-navy">
                    {profileCopy.basicsTitle}
                  </Text>
                  <Text className="mt-3 text-[15px] leading-6 text-soft-slate">
                    {profileCopy.basicsBody}
                  </Text>
                  <View
                    className={`mt-8 gap-3 ${
                      stackBasics ? 'flex-col' : 'flex-row items-start'
                    }`}>
                    <View className={stackBasics ? 'w-full' : 'w-[92px]'}>
                      <Text className="mb-2 text-[14px] font-bold text-ink-navy">
                        {profileCopy.ageLabel}
                      </Text>
                      <View className={`h-[57px] flex-row items-center rounded-[17px] border bg-surface px-3 ${
                        errors.age ? 'border-coral-notice' : 'border-quiet-dot'
                      }`}>
                        <TextInput
                          ref={ageInputRef}
                          accessibilityLabel={profileCopy.ageLabel}
                          className="min-w-0 flex-1 p-0 text-[17px] font-bold text-ink-navy"
                          keyboardType="number-pad"
                          maxLength={3}
                          onChangeText={(age) => {
                            setDraft((current) => ({ ...current, age }));
                            setErrors((current) => ({ ...current, age: undefined }));
                          }}
                          value={draft.age}
                        />
                        <Text className="ml-1 text-[12px] font-bold text-soft-slate">tuổi</Text>
                      </View>
                      {errors.age ? (
                        <Text accessibilityLiveRegion="polite" className="mt-2 text-[12px] text-coral-notice">
                          {errors.age}
                        </Text>
                      ) : null}
                    </View>
                    <GenderSelect
                      error={errors.gender}
                      onChange={(gender) => {
                        setDraft((current) => ({ ...current, gender }));
                        setErrors((current) => ({ ...current, gender: undefined }));
                      }}
                      value={draft.gender}
                    />
                  </View>
                  <PrimaryAction label={profileCopy.continue} onPress={continueFromBasics} />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Text className="text-[12px] font-extrabold tracking-[1px] text-label-slate">
                    {profileCopy.heightKicker}
                  </Text>
                  <Text className="mt-2 font-rounded text-[31px] font-extrabold leading-[37px] text-ink-navy">
                    {profileCopy.heightTitle}
                  </Text>
                  <Text className="mt-3 text-[15px] leading-6 text-soft-slate">
                    {profileCopy.heightBody}
                  </Text>
                  <View className="my-9 flex-row items-baseline justify-center">
                    <Text className="font-rounded text-[64px] font-extrabold tracking-[-3px] text-ink-navy">
                      {draft.heightCm}
                    </Text>
                    <Text className="ml-2 text-[20px] font-bold text-soft-slate">cm</Text>
                  </View>
                  <HeightRuler
                    onChange={(heightCm) =>
                      setDraft((current) => ({ ...current, heightCm }))
                    }
                    value={draft.heightCm}
                  />
                  <PrimaryAction label={profileCopy.finish} onPress={finish} />
                </>
              ) : null}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type PrimaryActionProps = {
  label: string;
  onPress: () => void;
};

function PrimaryAction({ label, onPress }: PrimaryActionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="mt-auto h-14 items-center justify-center rounded-[18px] bg-apricot"
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [
          { scale: pressed && !reduceMotion ? 0.98 : 1 },
          { translateY: pressed && !reduceMotion ? 1 : 0 },
        ],
      })}>
      <Text className="text-[16px] font-extrabold text-surface">{label}</Text>
    </Pressable>
  );
}
