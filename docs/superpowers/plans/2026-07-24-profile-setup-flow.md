# AURALE Profile Setup Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved three-step post-login profile setup wizard for name, age/gender, and a horizontally scrollable centimeter ruler.

**Architecture:** Keep the wizard in one Expo Router route with local React state, pure validation/ruler helpers in `lib/`, and focused UI components for the progress header, gender selector, and height ruler. The login success path replaces login with `/profile-setup`; completion replaces setup with `/(tabs)` without persisting or transmitting profile data until a separate storage design is approved.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, React 19.1.0, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, React Native Reanimated 4, Jest.

## Global Constraints

- Execute `docs/superpowers/plans/2026-07-22-login-screen.md` before Task 5 so `app/login.tsx` and the authenticated route flow exist.
- Read and follow Expo SDK 54 documentation only: `https://docs.expo.dev/versions/v54.0.0/`.
- NativeWind is `^5.0.0-preview.4`; follow `https://www.nativewind.dev/v5/llms-full.txt` and do not upgrade it.
- Add no new dependency, backend, database, global store, profile persistence, health-data calculation, or analytics.
- Keep the complete wizard in one route: `app/profile-setup.tsx`.
- Collect only name, whole-number age `5–120`, gender, and height `100–220 cm`.
- Do not create a nickname field in UI, types, state, validation, or payloads.
- Gender starts empty with placeholder `Chọn giới tính`; never preselect `Không muốn trả lời`.
- Gender options are exactly `Nam`, `Nữ`, and `Không muốn trả lời`.
- Height starts at `165 cm`; each small tick is `1 cm`, each labeled tall tick is `5 cm`.
- Do not show the removed height-range explanation or any mockup-only measurement annotations.
- Use supportive Vietnamese copy and preserve accessibility, large text, reduced motion, keyboard behavior, and minimum 44 px touch targets.
- Preserve unrelated user changes and leave the existing untracked `tmp/` directory untouched.

---

## File map

- `types/profile.ts` — profile draft, gender value, and step types.
- `constants/profile.ts` — approved copy, gender options, ranges, and defaults.
- `lib/profile-setup.ts` — pure validation and ruler offset/value functions.
- `components/profile/profile-progress.tsx` — back action, step count, and segmented progress.
- `components/profile/gender-select.tsx` — closed combo-box field and dependency-free modal selection sheet.
- `components/profile/height-ruler.tsx` — horizontal ruler, snapping, centered needle, and adjustable accessibility actions.
- `app/profile-setup.tsx` — local draft state, three step layouts, validation, animated transitions, and final navigation.
- `app/_layout.tsx` — registers the profile setup route.
- `app/login.tsx` — sends successful authentication to profile setup instead of tabs.
- `__tests__/profile-setup-logic-test.ts` — pure validation, range, and ruler math tests.
- `__tests__/profile-setup-content-test.ts` — approved copy, exclusions, defaults, layout, and accessibility source contract.
- `__tests__/profile-setup-navigation-test.ts` — stack registration, login destination, and final replacement contract.

---

### Task 1: Define the profile contract and pure validation/ruler behavior

**Files:**
- Create: `types/profile.ts`
- Create: `constants/profile.ts`
- Create: `lib/profile-setup.ts`
- Create: `__tests__/profile-setup-logic-test.ts`

**Interfaces:**
- Produces: `Gender`, `ProfileDraft`, `ProfileStep`, `PROFILE_DEFAULTS`, `GENDER_OPTIONS`, `validateName`, `validateAge`, `clampHeight`, `heightToOffset`, and `offsetToHeight`.
- Consumes: no app state or platform API.

- [ ] **Step 1: Write the failing pure-logic tests**

Create `__tests__/profile-setup-logic-test.ts`:

```ts
import {
  clampHeight,
  heightToOffset,
  offsetToHeight,
  validateAge,
  validateName,
} from '@/lib/profile-setup';

describe('profile setup logic', () => {
  it('trims names and rejects an empty result', () => {
    expect(validateName('  Linh  ')).toEqual({ value: 'Linh' });
    expect(validateName('   ')).toEqual({ error: 'Vui lòng nhập tên của bạn.' });
  });

  it('accepts only whole-number ages from 5 through 120', () => {
    expect(validateAge('5')).toEqual({ value: 5 });
    expect(validateAge('120')).toEqual({ value: 120 });
    expect(validateAge('4')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('121')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('24.5')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
    expect(validateAge('abc')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
  });

  it('clamps and converts ruler values at a 12 px tick interval', () => {
    expect(clampHeight(99)).toBe(100);
    expect(clampHeight(165)).toBe(165);
    expect(clampHeight(221)).toBe(220);
    expect(heightToOffset(100)).toBe(0);
    expect(heightToOffset(165)).toBe(780);
    expect(offsetToHeight(0)).toBe(100);
    expect(offsetToHeight(780)).toBe(165);
    expect(offsetToHeight(2000)).toBe(220);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts`

Expected: FAIL because `@/lib/profile-setup` does not exist.

- [ ] **Step 3: Define the shared profile types**

Create `types/profile.ts`:

```ts
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type ProfileStep = 0 | 1 | 2;

export type ProfileDraft = {
  name: string;
  age: string;
  gender: Gender | null;
  heightCm: number;
};
```

- [ ] **Step 4: Add the approved constants and copy**

Create `constants/profile.ts`:

```ts
import type { Gender, ProfileDraft } from '@/types/profile';

export const PROFILE_STEP_COUNT = 3;
export const MIN_AGE = 5;
export const MAX_AGE = 120;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 220;
export const DEFAULT_HEIGHT_CM = 165;
export const HEIGHT_TICK_SPACING = 12;

export const PROFILE_DEFAULTS: ProfileDraft = {
  name: '',
  age: '',
  gender: null,
  heightCm: DEFAULT_HEIGHT_CM,
};

export const GENDER_OPTIONS: ReadonlyArray<{ label: string; value: Gender }> = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Không muốn trả lời', value: 'prefer_not_to_say' },
];

export const profileCopy = {
  back: 'Quay lại',
  continue: 'Tiếp tục',
  finish: 'Hoàn tất',
  nameKicker: 'THÔNG TIN CÁ NHÂN',
  nameTitle: 'Mình nên gọi bạn là gì?',
  nameLabel: 'Tên',
  namePlaceholder: 'Tên của bạn',
  basicsKicker: 'THÔNG TIN CƠ BẢN',
  basicsTitle: 'Một chút về bạn',
  basicsBody: 'Thông tin này giúp AURALE điều chỉnh trải nghiệm phù hợp hơn với bạn.',
  ageLabel: 'Tuổi',
  genderLabel: 'Giới tính',
  genderPlaceholder: 'Chọn giới tính',
  heightKicker: 'CHIỀU CAO',
  heightTitle: 'Bạn cao bao nhiêu?',
  heightBody: 'Lướt thanh thước để chọn số đo phù hợp với bạn.',
  nameRequired: 'Vui lòng nhập tên của bạn.',
  ageInteger: 'Vui lòng nhập tuổi bằng số nguyên.',
  ageRange: 'Tuổi cần nằm trong khoảng 5–120.',
  genderRequired: 'Vui lòng chọn giới tính.',
} as const;
```

- [ ] **Step 5: Implement the pure helpers**

Create `lib/profile-setup.ts`:

```ts
import {
  HEIGHT_TICK_SPACING,
  MAX_AGE,
  MAX_HEIGHT_CM,
  MIN_AGE,
  MIN_HEIGHT_CM,
  profileCopy,
} from '@/constants/profile';

type ValidationResult<T> = { value: T } | { error: string };

export function validateName(input: string): ValidationResult<string> {
  const value = input.trim();
  return value ? { value } : { error: profileCopy.nameRequired };
}

export function validateAge(input: string): ValidationResult<number> {
  if (!/^\d+$/.test(input)) {
    return { error: profileCopy.ageInteger };
  }

  const value = Number(input);
  if (value < MIN_AGE || value > MAX_AGE) {
    return { error: profileCopy.ageRange };
  }

  return { value };
}

export function clampHeight(value: number): number {
  return Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, value));
}

export function heightToOffset(heightCm: number): number {
  return (clampHeight(heightCm) - MIN_HEIGHT_CM) * HEIGHT_TICK_SPACING;
}

export function offsetToHeight(offset: number): number {
  return clampHeight(
    MIN_HEIGHT_CM + Math.round(offset / HEIGHT_TICK_SPACING),
  );
}
```

- [ ] **Step 6: Run the focused test**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts`

Expected: PASS with 3 passing tests.

- [ ] **Step 7: Commit the logic unit**

```bash
git add types/profile.ts constants/profile.ts lib/profile-setup.ts __tests__/profile-setup-logic-test.ts
git commit -m "feat: define profile setup rules"
```

---

### Task 2: Build the progress header and gender combo box

**Files:**
- Create: `components/profile/profile-progress.tsx`
- Create: `components/profile/gender-select.tsx`
- Create: `__tests__/profile-setup-content-test.ts`

**Interfaces:**
- Consumes: `Gender`, `ProfileStep`, `GENDER_OPTIONS`, `PROFILE_STEP_COUNT`, and `profileCopy`.
- Produces: `ProfileProgress({ step, onBack })` and `GenderSelect({ value, onChange, error })`.

- [ ] **Step 1: Write the failing component source contract**

Create `__tests__/profile-setup-content-test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('profile setup content', () => {
  it('defines the approved gender combo box and progress accessibility', () => {
    const root = process.cwd();
    const constants = readFileSync(join(root, 'constants', 'profile.ts'), 'utf8');
    const gender = readFileSync(
      join(root, 'components', 'profile', 'gender-select.tsx'),
      'utf8',
    );
    const progress = readFileSync(
      join(root, 'components', 'profile', 'profile-progress.tsx'),
      'utf8',
    );

    expect(constants).toContain("gender: null");
    expect(constants).toContain("genderPlaceholder: 'Chọn giới tính'");
    expect(constants).toContain("'Không muốn trả lời'");
    expect(gender).toContain('Modal');
    expect(gender).toContain('accessibilityRole="combobox"');
    expect(gender).toContain('accessibilityViewIsModal');
    expect(progress).toContain('Màn ${step + 1} trên ${PROFILE_STEP_COUNT}');
    expect(`${constants}\n${gender}\n${progress}`).not.toContain('nickname');
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts`

Expected: FAIL because both profile components are missing.

- [ ] **Step 3: Implement the progress header**

Create `components/profile/profile-progress.tsx`:

```tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { PROFILE_STEP_COUNT, profileCopy } from '@/constants/profile';
import type { ProfileStep } from '@/types/profile';

type ProfileProgressProps = {
  step: ProfileStep;
  onBack: () => void;
};

export function ProfileProgress({ step, onBack }: ProfileProgressProps) {
  return (
    <>
      <View className="mb-6 flex-row items-center justify-between">
        {step > 0 ? (
          <Pressable
            accessibilityLabel={profileCopy.back}
            accessibilityRole="button"
            className="size-11 items-center justify-center rounded-[14px] border border-quiet-dot bg-surface"
            onPress={onBack}>
            <Text className="text-[25px] leading-7 text-ink-navy">‹</Text>
          </Pressable>
        ) : (
          <View className="size-11" />
        )}
        <Text className="text-[13px] font-bold text-label-slate">
          {step + 1} / {PROFILE_STEP_COUNT}
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Màn ${step + 1} trên ${PROFILE_STEP_COUNT}`}
        className="mb-8 flex-row gap-2">
        {Array.from({ length: PROFILE_STEP_COUNT }, (_, index) => (
          <View
            key={index}
            className={`h-[5px] flex-1 rounded-full ${
              index <= step ? 'bg-apricot' : 'bg-quiet-dot'
            }`}
          />
        ))}
      </View>
    </>
  );
}
```

- [ ] **Step 4: Implement the dependency-free gender selector**

Create `components/profile/gender-select.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GENDER_OPTIONS, profileCopy } from '@/constants/profile';
import type { Gender } from '@/types/profile';

type GenderSelectProps = {
  value: Gender | null;
  error?: string;
  onChange: (value: Gender) => void;
};

export function GenderSelect({ value, error, onChange }: GenderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = GENDER_OPTIONS.find((option) => option.value === value);

  return (
    <View className="min-w-0 flex-1">
      <Text className="mb-2 text-[14px] font-bold text-ink-navy">
        {profileCopy.genderLabel}
      </Text>
      <Pressable
        accessibilityLabel={profileCopy.genderLabel}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isOpen }}
        className={`h-[57px] flex-row items-center rounded-[17px] border bg-surface px-3 ${
          error ? 'border-coral-notice' : 'border-quiet-dot'
        }`}
        onPress={() => setIsOpen(true)}>
        <Text
          className={`min-w-0 flex-1 text-[14px] font-bold ${
            selected ? 'text-ink-navy' : 'text-soft-slate'
          }`}
          numberOfLines={1}>
          {selected?.label ?? profileCopy.genderPlaceholder}
        </Text>
        <Ionicons color="#697386" name="chevron-down" size={18} />
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" className="mt-2 text-[13px] text-coral-notice">
          {error}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}>
        <SafeAreaView
          accessibilityViewIsModal
          className="flex-1 justify-end bg-ink-navy/30">
          <Pressable
            accessibilityLabel="Đóng danh sách giới tính"
            className="flex-1"
            onPress={() => setIsOpen(false)}
          />
          <View className="rounded-t-[24px] bg-surface px-5 pb-4 pt-5">
            <Text className="mb-3 text-[18px] font-extrabold text-ink-navy">
              {profileCopy.genderLabel}
            </Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: value === option.value }}
                className="min-h-14 flex-row items-center justify-between border-b border-quiet-dot"
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}>
                <Text className="text-[16px] font-semibold text-ink-navy">
                  {option.label}
                </Text>
                {value === option.value ? (
                  <Ionicons color="#FF9E7A" name="checkmark" size={22} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
```

Use `style={{ backgroundColor: 'rgba(47,53,66,0.3)' }}` on the modal `SafeAreaView` instead of `bg-ink-navy/30`; this is an approved inline-style exception for the native modal backdrop.

- [ ] **Step 5: Add the Coral Notice theme token**

Add this token inside the existing `@theme` block in `global.css`:

```css
--color-coral-notice: #FF8B78;
```

- [ ] **Step 6: Run the component contract, type checker, and lint**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 7: Commit the shared controls**

```bash
git add components/profile/profile-progress.tsx components/profile/gender-select.tsx constants/profile.ts global.css __tests__/profile-setup-content-test.ts
git commit -m "feat: add profile setup controls"
```

---

### Task 3: Build the accessible snapping height ruler

**Files:**
- Create: `components/profile/height-ruler.tsx`
- Modify: `__tests__/profile-setup-content-test.ts`

**Interfaces:**
- Consumes: `MIN_HEIGHT_CM`, `MAX_HEIGHT_CM`, `HEIGHT_TICK_SPACING`, `heightToOffset`, and `offsetToHeight`.
- Produces: `HeightRuler({ value, onChange })`.

- [ ] **Step 1: Extend the failing source contract**

Add this test inside `describe` in `__tests__/profile-setup-content-test.ts`:

```ts
it('implements a whole-centimeter snapping adjustable ruler', () => {
  const source = readFileSync(
    join(process.cwd(), 'components', 'profile', 'height-ruler.tsx'),
    'utf8',
  );

  expect(source).toContain('snapToInterval={HEIGHT_TICK_SPACING}');
  expect(source).toContain('accessibilityRole="adjustable"');
  expect(source).toContain("name: 'increment'");
  expect(source).toContain("name: 'decrement'");
  expect(source).toContain('height % 5 === 0');
  expect(source).toContain('showsHorizontalScrollIndicator={false}');
  expect(source).not.toContain('Có thể điều chỉnh');
});
```

- [ ] **Step 2: Run the test and verify the new assertion fails**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts`

Expected: FAIL because `components/profile/height-ruler.tsx` is missing.

- [ ] **Step 3: Implement the ruler**

Create `components/profile/height-ruler.tsx`:

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  HEIGHT_TICK_SPACING,
  MAX_HEIGHT_CM,
  MIN_HEIGHT_CM,
} from '@/constants/profile';
import {
  clampHeight,
  heightToOffset,
  offsetToHeight,
} from '@/lib/profile-setup';

type HeightRulerProps = {
  value: number;
  onChange: (value: number) => void;
};

const heights = Array.from(
  { length: MAX_HEIGHT_CM - MIN_HEIGHT_CM + 1 },
  (_, index) => MIN_HEIGHT_CM + index,
);

export function HeightRuler({ value, onChange }: HeightRulerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const horizontalInset = Math.max(0, viewportWidth / 2 - HEIGHT_TICK_SPACING / 2);
  const contentStyle = useMemo(
    () => ({ paddingHorizontal: horizontalInset }),
    [horizontalInset],
  );

  useEffect(() => {
    if (!viewportWidth) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        animated: false,
        x: heightToOffset(value),
      });
    });
  }, [viewportWidth]);

  const updateFromOffset = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    onChange(offsetToHeight(event.nativeEvent.contentOffset.x));
  };

  const setAccessibleValue = (nextValue: number) => {
    const clamped = clampHeight(nextValue);
    onChange(clamped);
    scrollRef.current?.scrollTo({
      animated: true,
      x: heightToOffset(clamped),
    });
  };

  return (
    <View
      accessible
      accessibilityActions={[
        { name: 'increment', label: 'Tăng một centimet' },
        { name: 'decrement', label: 'Giảm một centimet' },
      ]}
      accessibilityLabel="Chiều cao"
      accessibilityRole="adjustable"
      accessibilityValue={{
        min: MIN_HEIGHT_CM,
        max: MAX_HEIGHT_CM,
        now: value,
        text: `${value} centimet`,
      }}
      className="relative border-y border-quiet-dot bg-surface"
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'increment') {
          setAccessibleValue(value + 1);
        }
        if (nativeEvent.actionName === 'decrement') {
          setAccessibleValue(value - 1);
        }
      }}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={contentStyle}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={updateFromOffset}
        onScroll={updateFromOffset}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={HEIGHT_TICK_SPACING}>
        {heights.map((height) => {
          const isMajor = height % 5 === 0;

          return (
            <View
              key={height}
              style={{ width: HEIGHT_TICK_SPACING }}
              className="items-center">
              <View
                className={`w-px bg-ink-navy ${
                  isMajor ? 'h-14' : 'h-8 opacity-40'
                }`}
              />
              {isMajor ? (
                <Text className="mt-2 text-[12px] font-bold text-label-slate">
                  {height}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <View
        pointerEvents="none"
        className="absolute bottom-6 left-1/2 top-3 w-[3px] -translate-x-1/2 rounded-full bg-apricot"
      />
    </View>
  );
}
```

Do not add haptic feedback in this first version. It is optional in the approved design, and omitting it avoids noisy feedback while the continuously updating ruler is being tuned.

- [ ] **Step 4: Run focused tests and static checks**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts __tests__/profile-setup-content-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS with `accessibilityRole="adjustable"` accepted by the installed React Native type definitions.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit the ruler**

```bash
git add components/profile/height-ruler.tsx __tests__/profile-setup-content-test.ts
git commit -m "feat: add accessible height ruler"
```

---

### Task 4: Compose the three-step local-state wizard

**Files:**
- Create: `app/profile-setup.tsx`
- Modify: `__tests__/profile-setup-content-test.ts`

**Interfaces:**
- Consumes: `PROFILE_DEFAULTS`, `profileCopy`, `ProfileProgress`, `GenderSelect`, `HeightRuler`, `validateName`, and `validateAge`.
- Produces: default export `ProfileSetupScreen`.

- [ ] **Step 1: Add the failing wizard contract**

Add this test inside `describe` in `__tests__/profile-setup-content-test.ts`:

```ts
it('composes exactly three local-state steps without nickname or persistence', () => {
  const source = readFileSync(
    join(process.cwd(), 'app', 'profile-setup.tsx'),
    'utf8',
  );

  expect(source).toContain('useState<ProfileDraft>(PROFILE_DEFAULTS)');
  expect(source).toContain('w-[92px]');
  expect(source).toContain('<GenderSelect');
  expect(source).toContain('<HeightRuler');
  expect(source).toContain("router.replace('/(tabs)')");
  expect(source).toContain('useReducedMotion');
  expect(source).not.toContain('nickname');
  expect(source).not.toContain('AsyncStorage');
  expect(source).not.toContain('supabase');
  expect(source).not.toContain('Có thể điều chỉnh');
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts`

Expected: FAIL because `app/profile-setup.tsx` is missing.

- [ ] **Step 3: Implement the screen state, validation, and three layouts**

Create `app/profile-setup.tsx` with:

```tsx
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
```

The exact responsive rule is: keep the approved single row when width is at least 360 px and `fontScale` is below 1.5; otherwise stack age above gender at full width.

- [ ] **Step 4: Run focused tests and static checks**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts __tests__/profile-setup-content-test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit the wizard**

```bash
git add app/profile-setup.tsx __tests__/profile-setup-content-test.ts
git commit -m "feat: add profile setup wizard"
```

---

### Task 5: Register the route and connect successful login

**Prerequisite:** The approved login implementation plan has been executed and `app/login.tsx` exists.

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/login.tsx`
- Create: `__tests__/profile-setup-navigation-test.ts`

**Interfaces:**
- Consumes: successful `signInWithProvider` result from the login implementation.
- Produces: login success → `/profile-setup`; setup completion → `/(tabs)`.

- [ ] **Step 1: Write the failing navigation contract**

Create `__tests__/profile-setup-navigation-test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('profile setup navigation', () => {
  it('places profile setup immediately after successful login', () => {
    const root = process.cwd();
    const layout = readFileSync(join(root, 'app', '_layout.tsx'), 'utf8');
    const login = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const profile = readFileSync(join(root, 'app', 'profile-setup.tsx'), 'utf8');

    expect(layout).toContain('<Stack.Screen name="profile-setup"');
    expect(login).toContain("router.replace('/profile-setup')");
    expect(login).not.toContain("router.replace('/(tabs)')");
    expect(profile).toContain("router.replace('/(tabs)')");
    expect(profile).not.toContain('AsyncStorage');
    expect(profile).not.toContain('supabase');
  });
});
```

- [ ] **Step 2: Run the navigation test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/profile-setup-navigation-test.ts`

Expected: FAIL because the route is not registered and login still replaces to tabs.

- [ ] **Step 3: Register the route**

Add to the root stack in `app/_layout.tsx`, immediately after the login screen:

```tsx
<Stack.Screen name="profile-setup" options={{ headerShown: false }} />
```

- [ ] **Step 4: Change only the successful login destination**

In `app/login.tsx`, replace the successful result navigation:

```ts
router.replace('/(tabs)');
```

with:

```ts
router.replace('/profile-setup');
```

Do not change cancellation, loading, error, or offline behavior.

- [ ] **Step 5: Run all focused tests**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts __tests__/profile-setup-content-test.ts __tests__/profile-setup-navigation-test.ts __tests__/login-navigation-test.ts
```

Expected: PASS. Update the prior login navigation test's success-destination assertion from tabs to profile setup if that test contains the old route.

- [ ] **Step 6: Run complete automated verification**

Run: `npm test`

Expected: every Jest suite passes.

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 7: Perform device-level verification**

Verify on at least one Android or iOS device/simulator:

1. Successful login replaces login with profile setup.
2. Step 1 rejects a blank name and trims surrounding whitespace.
3. Step 2 keeps age and gender on one row at normal text size.
4. The age field accepts 5 and 120, and rejects 4, 121, decimals, and letters.
5. The age number and `tuổi` remain visually adjacent.
6. Gender begins at `Chọn giới tính`, with no selected value.
7. Opening gender shows exactly Nam, Nữ, and Không muốn trả lời.
8. Back navigation preserves name, age, gender, and height.
9. The height ruler begins at 165 cm.
10. Small ticks advance by 1 cm and labeled tall ticks occur every 5 cm.
11. The ruler reaches exactly 100 and 220 cm and snaps to whole centimeters.
12. The height screen contains no range-explanation sentence.
13. Screen readers announce steps, validation errors, combo-box state, and adjustable height actions.
14. At 200% text scaling and on the smallest supported phone, content scrolls without clipping; age/gender stack only if the single row is no longer readable.
15. Reduced motion replaces horizontal movement with a calm fade.
16. `Hoàn tất` replaces setup with tabs and cannot navigate back into setup.
17. Relaunch behavior is unchanged because profile persistence is intentionally out of scope.

- [ ] **Step 8: Commit the navigation integration**

```bash
git add app/_layout.tsx app/login.tsx __tests__/profile-setup-navigation-test.ts __tests__/login-navigation-test.ts
git commit -m "feat: route login through profile setup"
```

---

## Deferred decisions

The following require a separate approved design before implementation:

- Where profile data is stored.
- How profile completion is remembered across launches and devices.
- Whether authenticated users with incomplete setup are blocked from tabs.
- Editing or deleting profile fields after setup.
- Any nutrition calculation derived from age, gender, or height.

Until those decisions are approved, the mobile implementation keeps the draft only in local component state and navigates to tabs on completion without saving it.

## Final review gate

Before claiming completion, invoke `superpowers:verification-before-completion`, then re-run:

```bash
npm test
npx tsc --noEmit
npm run lint
```

Report exact outputs. Do not claim profile persistence, cross-launch completion, or backend saving because none is included in this plan.
