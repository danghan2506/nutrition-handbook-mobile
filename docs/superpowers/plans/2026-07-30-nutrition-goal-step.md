# Nutrition Goal Profile Step Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required fifth profile-setup step where the user selects exactly one primary nutrition goal from five approved `GoalType` values.

**Architecture:** Extend the existing local `ProfileDraft` and centralized profile constants, add a focused accessible `NutritionGoalSelect` card-list component, and integrate it into the existing single-route wizard. Keep all values in local React state and preserve the current final navigation without adding persistence or nutrition calculations.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, React 19.1, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, React Native Reanimated 4, Lucide React Native 1.24, Jest 29

## Global Constraints

- Before modifying Expo or React Native code, read the exact Expo SDK 54 documentation at `https://docs.expo.dev/versions/v54.0.0/`.
- Before writing NativeWind code, use the installed `nativewind@5.0.0-preview.4` syntax and consult `https://www.nativewind.dev/v5/llms-full.txt`.
- Define the type name as `GoalType` with exactly `HEALTHY_EATING`, `WEIGHT_LOSS`, `WEIGHT_MAINTENANCE`, `WEIGHT_GAIN`, and `MUSCLE_GAIN`.
- The user selects exactly one goal and must select it before completion.
- Keep `goalType` only in the existing temporary local `ProfileDraft`.
- Do not add AsyncStorage, Supabase writes, backend calls, global state, nutrition calculations, routes, or dependencies.
- Use supportive, neutral Vietnamese copy and do not promise medical or weight outcomes.
- Use NativeWind for static styling and preserve the existing warm charcoal, ivory, sage, and restrained terracotta direction.
- Preserve reduced-motion transitions, transition locking, back-navigation state, screen-reader focus, and non-color-only selected states.

---

## File Structure

- Modify `types/profile.ts`: define the shared `GoalType` union, extend `ProfileStep` to step five, and add `goalType` to `ProfileDraft`.
- Modify `constants/profile.ts`: change the step count, add the default goal, define the ordered goal option content, and add screen/validation copy.
- Create `components/profile/nutrition-goal-select.tsx`: render and focus the accessible single-choice goal cards.
- Modify `app/profile-setup.tsx`: add the fifth step, activity-to-goal transition, validation, focus management, and final action.
- Modify `__tests__/profile-setup-logic-test.ts`: verify the exact data contract, order, and defaults.
- Modify `__tests__/profile-setup-content-test.ts`: verify component accessibility and five-step wizard integration.

---

### Task 1: Goal data contract and centralized content

**Files:**

- Modify: `__tests__/profile-setup-logic-test.ts`
- Modify: `types/profile.ts`
- Modify: `constants/profile.ts`

**Interfaces:**

- Produces: `GoalType`
- Produces: `ProfileDraft.goalType: GoalType | null`
- Produces: `ProfileStep = 0 | 1 | 2 | 3 | 4`
- Produces: `NUTRITION_GOAL_OPTIONS: ReadonlyArray<{ value: GoalType; label: string; description: string }>`
- Produces: `profileCopy.goalKicker`, `goalTitle`, `goalBody`, and `goalRequired`

- [ ] **Step 1: Write the failing data-contract test**

Update the constants import and replace the existing activity-only step-count
test with:

```ts
import {
  ACTIVITY_LEVEL_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  PROFILE_DEFAULTS,
  PROFILE_STEP_COUNT,
} from '@/constants/profile';

it('defines the activity and nutrition-goal profile steps', () => {
  expect(PROFILE_STEP_COUNT).toBe(5);
  expect(PROFILE_DEFAULTS.activityLevel).toBeNull();
  expect(PROFILE_DEFAULTS.goalType).toBeNull();
  expect(ACTIVITY_LEVEL_OPTIONS.map((option) => option.value)).toEqual([
    'sedentary',
    'light',
    'active',
    'very_active',
  ]);
  expect(
    ACTIVITY_LEVEL_OPTIONS.every((option) => option.details.length >= 3),
  ).toBe(true);
  expect(NUTRITION_GOAL_OPTIONS).toEqual([
    {
      value: 'HEALTHY_EATING',
      label: 'Ăn uống lành mạnh',
      description:
        'Xây dựng những lựa chọn cân bằng và phù hợp hơn mỗi ngày.',
    },
    {
      value: 'WEIGHT_LOSS',
      label: 'Giảm cân',
      description:
        'Hướng đến giảm cân từ từ với thói quen ăn uống bền vững.',
    },
    {
      value: 'WEIGHT_MAINTENANCE',
      label: 'Duy trì cân nặng',
      description:
        'Giữ cân nặng ổn định và duy trì nhịp sống hiện tại.',
    },
    {
      value: 'WEIGHT_GAIN',
      label: 'Tăng cân',
      description:
        'Tăng cân có chủ đích với nguồn dinh dưỡng phù hợp.',
    },
    {
      value: 'MUSCLE_GAIN',
      label: 'Tăng cường cơ bắp',
      description:
        'Hỗ trợ phát triển cơ bắp bằng dinh dưỡng và vận động.',
    },
  ]);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts
```

Expected: FAIL because `NUTRITION_GOAL_OPTIONS` and
`PROFILE_DEFAULTS.goalType` do not exist and the current step count is four.

- [ ] **Step 3: Add the exact shared types**

Add to `types/profile.ts`:

```ts
export type GoalType =
  | 'HEALTHY_EATING'
  | 'WEIGHT_LOSS'
  | 'WEIGHT_MAINTENANCE'
  | 'WEIGHT_GAIN'
  | 'MUSCLE_GAIN';

export type ProfileStep = 0 | 1 | 2 | 3 | 4;
```

Extend `ProfileDraft`:

```ts
goalType: GoalType | null;
```

- [ ] **Step 4: Add the constants and approved copy**

Import `GoalType` in `constants/profile.ts`, change
`PROFILE_STEP_COUNT` to `5`, set `goalType: null` in `PROFILE_DEFAULTS`, and add:

```ts
export const NUTRITION_GOAL_OPTIONS: ReadonlyArray<{
  value: GoalType;
  label: string;
  description: string;
}> = [
  {
    value: 'HEALTHY_EATING',
    label: 'Ăn uống lành mạnh',
    description:
      'Xây dựng những lựa chọn cân bằng và phù hợp hơn mỗi ngày.',
  },
  {
    value: 'WEIGHT_LOSS',
    label: 'Giảm cân',
    description:
      'Hướng đến giảm cân từ từ với thói quen ăn uống bền vững.',
  },
  {
    value: 'WEIGHT_MAINTENANCE',
    label: 'Duy trì cân nặng',
    description:
      'Giữ cân nặng ổn định và duy trì nhịp sống hiện tại.',
  },
  {
    value: 'WEIGHT_GAIN',
    label: 'Tăng cân',
    description:
      'Tăng cân có chủ đích với nguồn dinh dưỡng phù hợp.',
  },
  {
    value: 'MUSCLE_GAIN',
    label: 'Tăng cường cơ bắp',
    description:
      'Hỗ trợ phát triển cơ bắp bằng dinh dưỡng và vận động.',
  },
];
```

Add to `profileCopy`:

```ts
goalKicker: 'MỤC TIÊU DINH DƯỠNG',
goalTitle: 'Bạn muốn tập trung vào điều gì nhất?',
goalBody: 'Chọn một mục tiêu chính phù hợp với bạn lúc này.',
goalRequired: 'Vui lòng chọn mục tiêu dinh dưỡng của bạn.',
```

- [ ] **Step 5: Run the focused test and TypeScript check**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-logic-test.ts
npx tsc --noEmit
```

Expected: both commands PASS.

- [ ] **Step 6: Commit the data contract**

```bash
git add types/profile.ts constants/profile.ts __tests__/profile-setup-logic-test.ts
git commit -m "feat: define nutrition goal profile data"
```

---

### Task 2: Accessible nutrition-goal card selector

**Files:**

- Modify: `__tests__/profile-setup-content-test.ts`
- Create: `components/profile/nutrition-goal-select.tsx`

**Interfaces:**

- Consumes: `GoalType`
- Consumes: `NUTRITION_GOAL_OPTIONS`
- Produces: `NutritionGoalSelect`
- Produces: `NutritionGoalSelectHandle = { focus: () => void }`
- Props: `{ value: GoalType | null; disabled: boolean; error?: string; onChange: (value: GoalType) => void }`

- [ ] **Step 1: Write the failing component source test**

Add a test to `__tests__/profile-setup-content-test.ts`:

```ts
it('implements an accessible single-choice nutrition-goal card list', () => {
  const sourcePath = join(
    process.cwd(),
    'components',
    'profile',
    'nutrition-goal-select.tsx',
  );

  expect(existsSync(sourcePath)).toBe(true);
  if (!existsSync(sourcePath)) {
    return;
  }

  const source = readFileSync(sourcePath, 'utf8');

  expect(source).toContain('NUTRITION_GOAL_OPTIONS.map');
  expect(source).toContain('accessibilityRole="radiogroup"');
  expect(source).toContain('accessibilityRole="radio"');
  expect(source).toContain('checked: isSelected');
  expect(source).toContain('accessibilityLabel={`${option.label}. ${option.description}`}');
  expect(source).toContain('onPress={() => onChange(option.value)}');
  expect(source).toContain('export type NutritionGoalSelectHandle');
  expect(source).toMatch(/forwardRef<\s*NutritionGoalSelectHandle/);
  expect(source).toContain('AccessibilityInfo.setAccessibilityFocus');
  expect(source).toContain('optionRefs.current.HEALTHY_EATING');
  expect(source).toContain('✓');
  expect(source).toContain('accessibilityLiveRegion="polite"');
});
```

- [ ] **Step 2: Run the content test and verify it fails**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts
```

Expected: FAIL because
`components/profile/nutrition-goal-select.tsx` does not exist.

- [ ] **Step 3: Implement the selector shell and focus interface**

Create `components/profile/nutrition-goal-select.tsx` with:

```tsx
import {
  Dumbbell,
  Leaf,
  Scale,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  Text,
  View,
} from 'react-native';

import { NUTRITION_GOAL_OPTIONS } from '@/constants/profile';
import type { GoalType } from '@/types/profile';

type NutritionGoalSelectProps = {
  value: GoalType | null;
  disabled: boolean;
  error?: string;
  onChange: (value: GoalType) => void;
};

export type NutritionGoalSelectHandle = {
  focus: () => void;
};

const goalIcons = {
  HEALTHY_EATING: Leaf,
  WEIGHT_LOSS: TrendingDown,
  WEIGHT_MAINTENANCE: Scale,
  WEIGHT_GAIN: TrendingUp,
  MUSCLE_GAIN: Dumbbell,
} satisfies Record<GoalType, LucideIcon>;
```

Use `forwardRef`, store each `Pressable` in
`Partial<Record<GoalType, View | null>>`, and implement `focus()` with
`findNodeHandle`, `AccessibilityInfo.setAccessibilityFocus`, and
`HEALTHY_EATING` as the fallback target.

- [ ] **Step 4: Render the accessible card list**

Render a parent:

```tsx
<View accessibilityRole="radiogroup">
```

Map `NUTRITION_GOAL_OPTIONS`. Each `Pressable` must:

- use `accessibilityRole="radio"`;
- use `accessibilityLabel={`${option.label}. ${option.description}`}`;
- expose `{ checked: isSelected, disabled }`;
- call `onChange(option.value)`;
- render the mapped Lucide icon with `accessible={false}`, `size={26}`,
  `strokeWidth={2}`, and apricot or ink color;
- render the title and description at all times;
- render a bordered circular indicator with `✓` when selected;
- use a minimum 64 px card height and existing NativeWind palette tokens.

Render `error` below the list using:

```tsx
<Text
  accessibilityLiveRegion="polite"
  className="mt-1 text-[13px] text-coral-notice">
  {error}
</Text>
```

- [ ] **Step 5: Run focused tests, TypeScript, and lint**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts
npx tsc --noEmit
npm run lint
```

Expected: all commands PASS.

- [ ] **Step 6: Commit the selector**

```bash
git add components/profile/nutrition-goal-select.tsx __tests__/profile-setup-content-test.ts
git commit -m "feat: add nutrition goal selector"
```

---

### Task 3: Integrate the fifth wizard step

**Files:**

- Modify: `__tests__/profile-setup-content-test.ts`
- Modify: `app/profile-setup.tsx`

**Interfaces:**

- Consumes: `NutritionGoalSelect`
- Consumes: `NutritionGoalSelectHandle`
- Consumes: `ProfileDraft.goalType`
- Produces: five-step profile flow ending at the nutrition-goal step

- [ ] **Step 1: Update the failing wizard integration assertions**

Rename the test from “exactly four local-state steps” to “exactly five
local-state steps” and add or update these assertions:

```ts
expect(source).toContain('step === 4');
expect(source).toContain('<NutritionGoalSelect');
expect(source).toContain('value={draft.goalType}');
expect(source).toContain("changeStep(4, 'forward')");
expect(source).toContain('profileCopy.goalRequired');
expect(source).toContain('nutritionGoalSelectRef.current?.focus()');
expect(source).toContain('ref={nutritionGoalSelectRef}');
expect(source).toContain(
  'setDraft((current) => ({ ...current, goalType }))',
);
expect(source).toContain(
  'disabled={transitionPending || !draft.goalType}',
);
expect(source).toContain('label={profileCopy.continue}');
expect(source).toContain('label={profileCopy.finish}');
```

Update the interaction-lock assertion:

```ts
expect(guardedActions).toHaveLength(6);
```

- [ ] **Step 2: Run the content test and verify it fails**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts
```

Expected: FAIL because `profile-setup.tsx` still ends on step four and has only
five guarded actions.

- [ ] **Step 3: Add imports, error state, and focus management**

Import `NutritionGoalSelect` and `NutritionGoalSelectHandle`. Extend `Errors`
with `'goal'`. Add:

```ts
const nutritionGoalSelectRef = useRef<NutritionGoalSelectHandle>(null);
```

In the existing step-focus effect add:

```ts
if (step === 4) {
  nutritionGoalSelectRef.current?.focus();
}
```

- [ ] **Step 4: Split activity advancement from final completion**

Add:

```ts
const continueFromActivity = () => {
  runGuardedAction(() => {
    if (!draft.activityLevel) {
      setErrors({ activity: profileCopy.activityRequired });
      announceValidationErrors(profileCopy.activityRequired);
      return false;
    }
    setErrors({});
    changeStep(4, 'forward');
    return true;
  });
};
```

Keep the existing defensive activity validation in `finish`. Immediately after
it, add:

```ts
if (!draft.goalType) {
  setErrors({ goal: profileCopy.goalRequired });
  announceValidationErrors(profileCopy.goalRequired);
  return false;
}
```

Do not add a save call. Keep `router.replace('/(tabs)')`.

- [ ] **Step 5: Change the activity CTA and render step five**

On step four, use:

```tsx
<PrimaryAction
  disabled={transitionPending || !draft.activityLevel}
  label={profileCopy.continue}
  onPress={continueFromActivity}
/>
```

Add `step === 4` content with the approved kicker, title, body, a
`NutritionGoalSelect`, and the final action:

```tsx
<NutritionGoalSelect
  ref={nutritionGoalSelectRef}
  disabled={transitionPending}
  error={errors.goal}
  onChange={(goalType) => {
    setDraft((current) => ({ ...current, goalType }));
    setErrors((current) => ({ ...current, goal: undefined }));
  }}
  value={draft.goalType}
/>
<PrimaryAction
  disabled={transitionPending || !draft.goalType}
  label={profileCopy.finish}
  onPress={finish}
/>
```

Use the same heading/body spacing as the activity step and place the selector
inside a `View` with `className="mt-6"`.

- [ ] **Step 6: Run focused and full verification**

Run:

```bash
npm test -- --runTestsByPath __tests__/profile-setup-content-test.ts __tests__/profile-setup-logic-test.ts
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all commands PASS and `git diff --check` prints no output.

- [ ] **Step 7: Manually inspect the Expo web flow**

Start the existing app without changing dependencies:

```bash
npm run web
```

Verify:

- the progress indicator shows `5 / 5`;
- the activity CTA advances to nutrition goals;
- exactly five cards appear in the approved order;
- only one card is selected at once;
- selection has a visible check indicator;
- `Hoàn tất` is disabled until selection;
- navigating back and forward preserves the selected goal;
- small viewport width and increased text size do not clip option labels;
- no profile field is written to storage or sent over the network.

- [ ] **Step 8: Commit the integrated flow**

```bash
git add app/profile-setup.tsx __tests__/profile-setup-content-test.ts
git commit -m "feat: add nutrition goal profile step"
```

---

### Task 4: Final scope and regression audit

**Files:**

- Inspect: all files changed since the design commit

**Interfaces:**

- Consumes: the complete five-step flow
- Produces: verified, review-ready implementation with no additional scope

- [ ] **Step 1: Confirm the final diff stays in scope**

Run:

```bash
git diff 7cff893..HEAD -- types/profile.ts constants/profile.ts components/profile/nutrition-goal-select.tsx app/profile-setup.tsx __tests__/profile-setup-logic-test.ts __tests__/profile-setup-content-test.ts
git status --short
```

Expected: only the six planned implementation/test files are changed by the
feature commits. Existing unrelated `tmp/` content remains untracked and
untouched.

- [ ] **Step 2: Re-run the release checks from a clean implementation diff**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check 7cff893..HEAD
```

Expected: all commands PASS and the diff check prints no output.

- [ ] **Step 3: Review the approved acceptance criteria**

Confirm all of the following from code, tests, and the manual flow:

- five steps;
- exact `GoalType` values and option order;
- single required selection;
- accessible focus, radio role, checked state, visible check, and error;
- activity-to-goal transition;
- selected goal preserved during in-flow navigation;
- final navigation unchanged;
- no persistence, nutrition calculation, dependency, backend, or route added.
