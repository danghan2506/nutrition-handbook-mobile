# Profile Weight Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required 20–300 kg weight input to the existing age and gender screen in the post-login profile setup flow.

**Architecture:** Extend the existing `ProfileDraft`, profile constants, and validation helper, then wire the new value into the existing local-state wizard. Preserve the current three-step route and responsive layout; no persistence or new component is introduced.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript, Expo Router 6, NativeWind 5 preview, Jest.

## Global Constraints

- Keep the existing three-step profile setup flow unchanged.
- Keep the current screen structure and visual language; only add the weight field.
- Weight is required, integer-only, and valid from 20–300 kg inclusive.
- Do not add dependencies, persistence, backend changes, routes, or reusable components.
- Use NativeWind classes except where the existing React Native-specific exceptions already apply.

---

### Task 1: Weight data and validation

**Files:**
- Modify: `__tests__/profile-setup-logic-test.ts`
- Modify: `types/profile.ts`
- Modify: `constants/profile.ts`
- Modify: `lib/profile-setup.ts`

**Interfaces:**
- Consumes: existing `ValidationResult<T>` and `profileCopy` patterns.
- Produces: `ProfileDraft.weightKg: string`, `MIN_WEIGHT_KG`, `MAX_WEIGHT_KG`, and `validateWeight(input: string): ValidationResult<number>`.

- [ ] **Step 1: Write the failing validation tests**

Add:

```ts
import { validateWeight } from '@/lib/profile-setup';

test('accepts weight boundaries', () => {
  expect(validateWeight('20')).toEqual({ value: 20 });
  expect(validateWeight('300')).toEqual({ value: 300 });
});

test('rejects non-integer weight input', () => {
  expect(validateWeight('')).toEqual({
    error: 'Vui lòng nhập cân nặng bằng số nguyên.',
  });
  expect(validateWeight('65.5')).toEqual({
    error: 'Vui lòng nhập cân nặng bằng số nguyên.',
  });
  expect(validateWeight('abc')).toEqual({
    error: 'Vui lòng nhập cân nặng bằng số nguyên.',
  });
});

test('rejects weight outside 20–300 kg', () => {
  expect(validateWeight('19')).toEqual({
    error: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
  });
  expect(validateWeight('301')).toEqual({
    error: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- __tests__/profile-setup-logic-test.ts
```

Expected: FAIL because `validateWeight` does not exist.

- [ ] **Step 3: Add the minimal data model and validation**

Add to `ProfileDraft`:

```ts
weightKg: string;
```

Add constants and default:

```ts
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;

weightKg: '',
```

Add copy:

```ts
weightLabel: 'Cân nặng',
weightInteger: 'Vui lòng nhập cân nặng bằng số nguyên.',
weightRange: 'Cân nặng cần nằm trong khoảng 20–300 kg.',
```

Add validation:

```ts
export function validateWeight(input: string): ValidationResult<number> {
  if (!/^\d+$/.test(input)) {
    return { error: profileCopy.weightInteger };
  }

  const value = Number(input);
  if (value < MIN_WEIGHT_KG || value > MAX_WEIGHT_KG) {
    return { error: profileCopy.weightRange };
  }

  return { value };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- __tests__/profile-setup-logic-test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add __tests__/profile-setup-logic-test.ts types/profile.ts constants/profile.ts lib/profile-setup.ts
git commit -m "feat: validate profile weight"
```

### Task 2: Existing profile setup screen integration

**Files:**
- Modify: `__tests__/profile-setup-content-test.ts`
- Modify: `app/profile-setup.tsx`

**Interfaces:**
- Consumes: `ProfileDraft.weightKg`, `validateWeight`, and `profileCopy.weightLabel`.
- Produces: a required weight field on step 1 using the existing local draft and error state.

- [ ] **Step 1: Write failing source-integration assertions**

Add assertions that the route:

```ts
expect(source).toContain('validateWeight(draft.weightKg)');
expect(source).toContain('accessibilityLabel={profileCopy.weightLabel}');
expect(source).toContain('keyboardType="number-pad"');
expect(source).toContain('maxLength={3}');
expect(source).toContain('value={draft.weightKg}');
expect(source).toContain('>kg</Text>');
expect(source).toContain('nextErrors.weight');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- __tests__/profile-setup-content-test.ts
```

Expected: FAIL because the route does not render or validate weight.

- [ ] **Step 3: Integrate weight into the existing route**

Extend the error keys:

```ts
type Errors = Partial<Record<'name' | 'age' | 'gender' | 'weight', string>>;
```

Add a `weightInputRef`, focus behavior for step 1 remains on age, and import
`validateWeight`.

In both `continueFromBasics` and `finish`, validate:

```ts
const weightResult = validateWeight(draft.weightKg);
if ('error' in weightResult) {
  nextErrors.weight = weightResult.error;
}
```

Include `nextErrors.weight` in accessibility announcements and include invalid
weight in the final-validation condition.

Inside the existing responsive field container, add a compact weight block
between age and `GenderSelect`:

```tsx
<View className={stackBasics ? 'w-full' : 'w-[108px]'}>
  <Text className="mb-2 text-[14px] font-bold text-ink-navy">
    {profileCopy.weightLabel}
  </Text>
  <View
    className={`h-[57px] flex-row items-center rounded-[17px] border bg-surface px-3 ${
      errors.weight ? 'border-coral-notice' : 'border-quiet-dot'
    }`}>
    <TextInput
      ref={weightInputRef}
      accessibilityLabel={profileCopy.weightLabel}
      className="min-w-0 flex-1 p-0 text-[17px] font-bold text-ink-navy"
      keyboardType="number-pad"
      maxLength={3}
      onChangeText={(weightKg) => {
        setDraft((current) => ({ ...current, weightKg }));
        setErrors((current) => ({ ...current, weight: undefined }));
      }}
      value={draft.weightKg}
    />
    <Text className="ml-1 text-[12px] font-bold text-soft-slate">kg</Text>
  </View>
  {errors.weight ? (
    <Text
      accessibilityLiveRegion="polite"
      className="mt-2 text-[12px] text-coral-notice">
      {errors.weight}
    </Text>
  ) : null}
</View>
```

Keep all other screen markup and styling unchanged.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- __tests__/profile-setup-content-test.ts __tests__/profile-setup-logic-test.ts
```

Expected: PASS.

- [ ] **Step 5: Run complete verification**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all commands pass without errors.

- [ ] **Step 6: Commit**

```bash
git add __tests__/profile-setup-content-test.ts app/profile-setup.tsx
git commit -m "feat: add required profile weight field"
```
