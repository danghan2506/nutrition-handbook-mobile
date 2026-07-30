# Nutrition Goal Profile Step Design

**Date:** 2026-07-30
**Status:** Approved design
**Scope:** Add a required nutrition-goal step to the existing local profile setup flow

## Goal

Add a fifth and final profile setup step that asks the user to choose one primary
nutrition goal. The step should feel calm, supportive, and consistent with the
existing activity-level step.

This specification covers the interface, temporary form state, validation,
accessibility, and navigation behavior only. It does not approve persistence,
backend changes, nutrition calculations, calorie or macronutrient targets, or
health recommendations derived from the selected goal.

## Updated profile setup sequence

Keep the profile setup wizard in the existing `app/profile-setup.tsx` route and
increase it from four steps to five:

```text
Step 1: Name
Step 2: Age + weight + gender
Step 3: Height
Step 4: Activity level
Step 5: Nutrition goal
```

The activity-level step uses `Tiếp tục` as its primary action. The new
nutrition-goal step becomes the only step with the `Hoàn tất` action.

Back navigation preserves every temporary form value, including the selected
activity level and nutrition goal.

## Nutrition goal data

Define the following shared TypeScript type:

```ts
export type GoalType =
  | 'HEALTHY_EATING'
  | 'WEIGHT_LOSS'
  | 'WEIGHT_MAINTENANCE'
  | 'WEIGHT_GAIN'
  | 'MUSCLE_GAIN';
```

Add `goalType: GoalType | null` to `ProfileDraft`. Its default value is `null`.
Keep the value in the route's existing local React state. Do not persist, send,
or derive nutrition targets from it.

## Screen content

Use the following screen copy:

- Context label: `MỤC TIÊU DINH DƯỠNG`
- Heading: `Bạn muốn tập trung vào điều gì nhất?`
- Supporting text: `Chọn một mục tiêu chính phù hợp với bạn lúc này.`
- Required-selection error: `Vui lòng chọn mục tiêu dinh dưỡng của bạn.`
- Primary action: `Hoàn tất`

Display exactly five options in this order:

1. `Ăn uống lành mạnh` — `Xây dựng những lựa chọn cân bằng và phù hợp hơn mỗi ngày.`
2. `Giảm cân` — `Hướng đến giảm cân từ từ với thói quen ăn uống bền vững.`
3. `Duy trì cân nặng` — `Giữ cân nặng ổn định và duy trì nhịp sống hiện tại.`
4. `Tăng cân` — `Tăng cân có chủ đích với nguồn dinh dưỡng phù hợp.`
5. `Tăng cường cơ bắp` — `Hỗ trợ phát triển cơ bắp bằng dinh dưỡng và vận động.`

The copy is supportive and does not promise a health outcome. It must not imply
diagnosis, treatment, or personalized medical advice.

## Selection interaction and layout

Render the options as a vertically stacked list of selection cards. Each card
contains:

- a restrained visual icon;
- the option label;
- its short supporting description; and
- a radio or check indicator that communicates selection without relying on
  color alone.

The cards use the existing warm wellness palette, spacing, typography, border
radii, and selected-state treatment established by the profile setup flow.
Touch targets must be at least 44 px high. The layout must remain readable on
small phones and with larger accessibility text.

Only one option can be selected. Choosing a new card replaces the previous
selection. The selection remains available when the user moves backward and
returns to this step.

## Validation and completion behavior

The nutrition goal is required.

- The `Hoàn tất` button remains disabled while `goalType` is `null`.
- Selecting a goal enables the button.
- Final validation still checks `goalType` defensively.
- If the goal is missing during final validation, keep or return the user to
  step five, show the approved inline error, and announce it for screen readers.
- Existing final validation for name, basic information, height, and activity
  level remains intact.
- After all temporary fields pass validation, preserve the current behavior:
  navigate to `/(tabs)` without persisting the profile.

## Component boundaries

- `types/profile.ts`: define `GoalType` and add `goalType` to `ProfileDraft`.
- `constants/profile.ts`: define the ordered goal options, default value, and
  screen/validation copy.
- `components/profile/nutrition-goal-select.tsx`: own the five-card selection
  UI, single-selection behavior, visual state, and control-level accessibility.
- `app/profile-setup.tsx`: coordinate the fifth step, transitions, validation,
  temporary state, and final navigation.

Do not add dependencies, global state, storage, backend calls, new routes, or
nutrition-calculation logic.

## Accessibility requirements

- Expose the option list as a single-choice radio group where supported.
- Expose each card's label, description, and selected state to assistive
  technology.
- Do not communicate selection through color alone.
- Move accessibility focus to the goal selector when entering step five.
- Announce the step as `Màn 5 trên 5`.
- Announce the required-selection error if defensive final validation fails.
- Preserve reduced-motion behavior and the current guarded transition behavior.

## Verification

The implementation is acceptable when:

- The progress UI shows five steps and announces the correct step count.
- The activity-level step advances to the nutrition-goal step instead of
  completing the flow.
- The screen presents exactly the five approved `GoalType` options in the
  approved order.
- Selecting one option clears the prior selection and updates `ProfileDraft`.
- A goal is required before completion.
- Back and forward navigation preserve the selected goal.
- Completing a valid form keeps the existing navigation to `/(tabs)`.
- No goal or other profile field is persisted.
- Focused component and source-level flow tests pass.
- The full Jest suite, TypeScript check, lint, and `git diff --check` pass.

## Out of scope

- AsyncStorage, Supabase, or any other profile persistence.
- Multiple simultaneous nutrition goals.
- Goal-specific calorie, macronutrient, weight, or time targets.
- Personalized nutrition plans or automated recommendations.
- Editing the nutrition goal after profile setup.
- Backend, analytics, authentication, or navigation architecture changes.
