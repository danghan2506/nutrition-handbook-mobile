# AURALE Profile Setup Flow Design

**Date:** 2026-07-24
**Status:** Approved visual design
**Scope:** Post-login profile collection flow and interaction design only

## Purpose

After a successful login, collect the minimum personal information needed for a future personalized AURALE experience: name, age, gender selection, and height.

This specification approves the interface and local in-flow behavior only. It does not approve a profile database, backend schema, health-data persistence, nutrition calculations, or changes to authentication architecture.

## Approved route sequence

```text
Successful login → Profile setup → Signed-in application
```

Profile setup is presented as a three-step wizard inside one route rather than three separate routes:

```text
Step 1: Name
Step 2: Age + gender
Step 3: Height
```

The route keeps temporary form values in local React state while the user moves between steps. Back navigation returns to the previous step without clearing values. The final action validates the complete form before any future save operation.

The implementation must not persist or send these values until a storage approach is separately approved.

## Shared visual direction

Follow the existing AURALE design system:

- Cloud Canvas (`#FFF9F0`) screen background.
- Clean Surface (`#FFFFFF`) fields and controls.
- Ink Navy (`#2F3542`) primary text.
- Soft Slate (`#697386`) supporting text.
- Apricot Action (`#FF9E7A`) progress, focus, and primary CTA.
- Three-segment progress bar plus a `1 / 3`, `2 / 3`, or `3 / 3` step counter.
- Back button on steps two and three.
- One filled CTA per step.
- Generous spacing, readable type, and minimum 44 px touch targets.

Do not render device chrome, mockup measurements, `Connected`, width annotations, or any other Visual Companion-only labels in the application.

## Step 1: Name

### Content

- Context label: `THÔNG TIN CÁ NHÂN`
- Heading: `Mình nên gọi bạn là gì?`
- One required text field labeled `Tên`
- Primary action: `Tiếp tục`

Nickname is removed completely. Do not render, collect, store, or model a nickname field.

Trim leading and trailing whitespace. Empty or whitespace-only names cannot advance.

## Step 2: Age and gender

### Layout

Place age and gender on the same horizontal row:

- Age uses a compact fixed-width field of approximately 92 px.
- Gender fills the remaining row width.
- Keep a 12 px gap between the fields.
- The age value and unit appear together as a compact group, for example `24 tuổi`; do not spread the unit to the far edge of the field.

On very narrow screens or with accessibility text scaling that makes the row unreadable, the implementation may stack the two fields vertically.

### Age

- Label: `Tuổi`
- Required direct numeric input.
- Use the numeric keyboard where supported.
- Show the unit `tuổi` directly after the entered number.
- Accept whole-number ages from `5` through `120`, inclusive.
- Reject empty, non-numeric, decimal, and out-of-range values.
- Do not infer or collect date of birth.


### Gender

- Label: `Giới tính`
- Use a combo box-style field.
- The field is empty by default and shows a neutral placeholder such as `Chọn giới tính`.
- Do not preselect `Không muốn trả lời`.
- Opening the control presents exactly:
  1. `Nam`
  2. `Nữ`
  3. `Không muốn trả lời`
- The user must actively choose one option before continuing; `Không muốn trả lời` is the explicit opt-out choice.
- Primary action: `Tiếp tục`

On mobile, the combo box may open as an accessible bottom sheet or native-style selection list, while retaining the compact field appearance in its closed state. The final interaction primitive must not add a new dependency without approval.

## Step 3: Height

### Content

- Context label: `CHIỀU CAO`
- Heading: `Bạn cao bao nhiêu?`
- Short guidance: `Lướt thanh thước để chọn số đo phù hợp với bạn.`
- Large current value with `cm`.
- Primary action: `Hoàn tất`

Do not show the removed explanatory sentence about the adjustable range. Keep this screen minimal.

### Ruler behavior

- Supported range: `100–220 cm`.
- Initial value: `165 cm`.
- A fixed selection needle stays centered while the ruler moves horizontally beneath it.
- Every `1 cm` has a small vertical tick.
- Every `5 cm` has a taller vertical tick and numeric label.
- The ruler snaps to whole-centimeter values.
- The large displayed value updates as the ruler moves.
- Dragging should feel continuous and may include restrained haptic feedback when the selected centimeter changes, using the already-installed Expo Haptics package.
- The endpoints must remain selectable by including appropriate leading and trailing inset.

The selection must remain operable without relying on color alone. Provide an accessible adjustable control with the current value announced in centimeters and increment/decrement actions for assistive technology.

## Transition behavior

- Advancing uses a subtle horizontal transition consistent with the direction of progress.
- Returning uses the reverse direction.
- Keep transitions short and calm, approximately 160–240 ms.
- Respect reduced-motion preferences by replacing movement with a restrained fade or immediate state change.
- Prevent multiple rapid presses from skipping steps.
- Keyboard focus should move to the first relevant control when a step changes.

## Validation and error behavior

- Validate only the current step when `Tiếp tục` is pressed.
- Show concise inline errors below the affected field.
- Preserve valid values when returning to earlier steps.
- Do not use alarming colors, punitive wording, or toast-only errors.
- The final action validates all fields again before invoking a future save operation.

## Component boundaries

The future implementation should keep the route readable:

- `app/profile-setup.tsx`: wizard state, step transitions, validation coordination, and final navigation.
- Step content can remain inside the route initially if it stays readable.
- Extract the height ruler into a focused reusable component because it owns scrolling, snapping, ticks, accessibility, and value calculations.
- Extract the progress indicator only if an existing onboarding component cannot be reused cleanly.

Do not introduce global state, persistence, a backend client, or a new picker/slider dependency solely for this mockup.

## Responsive and accessibility requirements

- Respect top and bottom safe areas.
- Allow the screen to scroll when a small viewport, keyboard, or larger text would clip content.
- Maintain at least 44 px touch targets.
- Associate visible labels with their controls and provide screen-reader labels.
- Announce validation errors and step changes.
- Do not use placeholder text as the only label.
- Preserve the age/gender single-row layout only while both controls remain readable.

## Future verification criteria

The implementation is acceptable when:

- Successful login routes first-time users into the profile setup flow.
- The flow has exactly three steps in one route.
- Nickname is absent from UI, types, state, and payloads.
- Age and gender share one row at normal phone widths.
- Age accepts only whole numbers from 5 through 120.
- The age field is compact and renders the number next to `tuổi`.
- Gender is empty by default and does not silently select an option.
- The gender control exposes exactly the three approved choices.
- Height defaults to 165 cm and supports the complete 100–220 cm range.
- Small ticks represent 1 cm and labeled large ticks represent 5 cm.
- Back navigation preserves entered values.
- Reduced motion, text scaling, screen readers, and small phone layouts are verified.
- Relevant tests and `npm run lint` pass.

## Out of scope

- Database tables, Supabase profile schema, RLS policies, or profile APIs.
- AsyncStorage or other persistence for profile data.
- Nutrition targets or calculations derived from age, gender, or height.
- Date of birth, weight, activity level, health conditions, or nickname.
- Editing the profile after setup.
- Skip behavior for the overall setup flow.
- Implementing the approved mockup during this design phase.
