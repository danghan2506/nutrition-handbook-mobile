# Profile Weight Field Design

## Goal

Add a required weight field to the existing basic-information step of the
post-login profile setup flow without redesigning the screen or adding another
step.

## User experience

- Keep the existing three-step profile setup flow unchanged.
- Keep the current “Một chút về bạn” screen, typography, colors, spacing,
  progress header, gender selector, and primary action.
- Display the basic fields in this order: age, weight, gender.
- Age and weight use compact numeric inputs. Weight displays `kg` as a suffix.
- Gender continues to use the existing combo box and starts empty.
- On narrow screens or with large accessibility font sizes, the fields use the
  screen's existing stacked responsive layout.
- Do not show the valid weight range as permanent helper copy. Show validation
  feedback only when the submitted value is invalid.

## Data and validation

- Add `weightKg` as a string to `ProfileDraft`, matching the temporary input
  representation already used by age.
- The default value is empty.
- Weight is required and must contain digits only.
- The accepted range is 20–300 kg, inclusive.
- Empty, decimal, signed, or non-numeric values show:
  `Vui lòng nhập cân nặng bằng số nguyên.`
- Values outside the accepted range show:
  `Cân nặng cần nằm trong khoảng 20–300 kg.`
- The basic-information step cannot advance until age, gender, and weight are
  valid.
- Final validation sends the user back to the basic-information step if weight
  has become invalid.
- Profile persistence remains out of scope, consistent with the existing flow.

## Implementation boundaries

- Extend the existing constants, profile type, validation helper, and
  `app/profile-setup.tsx`.
- Reuse the current NativeWind styling patterns and local React state.
- Do not add dependencies, storage, backend changes, new routes, or reusable
  components.

## Verification

- Add validation tests for the inclusive boundaries, empty input, decimals,
  non-numeric values, and out-of-range values.
- Update source-level profile setup tests to cover the field, unit suffix, and
  required validation integration.
- Run the focused tests, full Jest suite, TypeScript check, lint, and
  `git diff --check`.
