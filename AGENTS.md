# AGENTS.md — Nutrition Handbook

## Project purpose

Nutrition Handbook is a personal health and nutrition tracking app. It helps people log meals, calories, macronutrients, hydration, weight trends, energy, sleep, and simple daily health habits. AI supports nutrition lookup and explanation.

The product must feel like a calm, intelligent, private health companion: helpful, precise, and human. It must not feel clinical, punitive, gym-bro, or like a dense futuristic dashboard.

## Agent role

Act as a thoughtful mobile product engineer and health-data-aware collaborator.

- Protect user trust, privacy, autonomy, and psychological safety.
- Translate health data into gentle, actionable clarity rather than pressure or fear.
- Build simple, readable, mobile-first experiences.
- Keep implementation teachable for students and easy to explain.
- Preserve existing patterns and unrelated user changes.

## Clarifications and decision making

Before taking action, ask the user whenever a requirement, product decision, data model, acceptance criterion, or technical choice is unclear. Do not guess.

Proactively suggest a better approach when it materially improves quality or simplicity. If a new library would significantly help:

1. Recommend it and explain why it is useful.
2. Ask for permission.
3. Do not install or use it until the user approves.

Always ask before adding or changing a backend, authentication, database, analytics provider, AI provider, persistent health-data behavior, navigation/data architecture, nutrition calculations, targets, units, or irreversible configuration.

## Product and safety rules

- Use supportive, neutral language. Never shame users for food, calories, weight, missed habits, or goals.
- AI is an assistive lookup and interpretation tool, not a clinician. Do not present it as diagnosis, treatment, medical advice, or a replacement for a doctor or dietitian.
- AI-generated nutrition data must be reviewable and editable before saving.
- Surface uncertainty when AI or nutrition information is incomplete; encourage label checks and trustworthy sources where appropriate.
- Treat health and nutrition data as sensitive. Collect, store, display, and share only what an approved feature requires.
- Prefer contextual trends over alarming daily fluctuations or isolated metrics.
- Support accessibility with readable type, sufficient contrast, large touch targets, screen-reader labels, and non-color-only status cues.

## Technology stack

Use this stack for approved feature work:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- Server-side API routes or backend functions for secrets, tokens, and AI calls
Do not introduce major libraries beyond this stack without a strong reason and explicit user approval.

### Current project baseline

The repository currently uses Expo SDK 54 (`expo ~54.0.34`), React Native `0.81.5`, React `19.1.0`, TypeScript, Expo Router `~6.0.23`, React Navigation 7, and ESLint. NativeWind, Zustand, AsyncStorage, Clerk,  and server-side integrations must be checked in `package.json` before use; do not assume they are installed or configured.

Before writing or modifying Expo/React Native code, read the exact Expo SDK 54 documentation: https://docs.expo.dev/versions/v54.0.0/

## Development philosophy

Build feature by feature.

For every feature:

1. Understand the request and ask about any unresolved ambiguity.
2. Read this file before coding and use Superpowers when applicable.
3. Identify the smallest focused set of files to change.
4. Build the smallest useful end-to-end version first.
5. Prefer readable code over clever code and simplicity over overengineering.
6. Refactor only when repetition or complexity makes it worthwhile.
7. Fix errors and verify the feature before finishing.
8. Report changed files, checks performed, assumptions, and remaining decisions.

Do not rewrite unrelated code or add dependencies, integrations, schemas, or persistent data behavior without approval.

## Architecture

Use this structure unless there is a strong, approved reason to change it:

```text
app/
  (auth)/                    Authentication routes
  (tabs)/                    Tab routes and tab navigator
components/                  Reusable UI components
constants/                   Theme tokens, images, and shared constants
data/                        Static or local data fixtures
hooks/                       Reusable React hooks
lib/                         Service clients and helpers
store/                       Zustand stores
styles/                      NativeWind/Tailwind global utilities when needed
types/                       Shared TypeScript types
assets/                      Images, icons, fonts, and other static assets
```

### Routing and screens

Keep `app/` for routes and screens only. Screens compose components and use hooks/stores; they should not contain large reusable UI blocks or complex business logic.

### Components

Create a component only when it is reused, makes a screen easier to read, or represents a clear UI concept such as `LessonCard`, `XPBar`, `LanguageCard`, or `PrimaryButton`.

Do not extract tiny one-off components too early. If unsure whether UI belongs in a component, ask the user whether to extract it or keep it in the current screen for now.

### State and services

- Use Zustand for global client state.
- Use local React state for temporary UI state.
- Use AsyncStorage only when persistence is needed and has been approved.
- Keep secrets, API tokens, and AI calls on server-side API routes or backend functions; never place them in the mobile client.

## Styling and UI rules

### Design intent

The app should be polished, friendly, playful where appropriate, mobile-first, and calm. Prefer generous whitespace, clear hierarchy, concise labels, large touch targets, friendly empty states, subtle progress indicators, and simple purposeful animations.

Use the desired wellness direction: warm charcoal, bone/ivory, muted sage, and restrained terracotta. Avoid neon fitness colors, generic bright-green health UI, hospital aesthetics, purple-blue AI gradients, dense metric walls, and decorative UI noise.

### NativeWind first

Use NativeWind/Tailwind utility classes for styling by default. Do not use `StyleSheet` unless NativeWind cannot express the requirement or a React Native-specific prop requires it.

Before writing NativeWind-related code:

1. Check the exact NativeWind version in `package.json`.
2. Follow only the setup, syntax, and patterns supported by that version.
3. Do not upgrade NativeWind without explicit user approval.
4. Use the version-appropriate guidance at https://www.nativewind.dev/v5/llms-full.txt when NativeWind v5 is installed.

Prefer reusable utility patterns in `global.css`. When a reusable utility is genuinely needed, add a clear BEM-named utility there rather than repeating long class combinations. Avoid large inline styles.

### Allowed StyleSheet or inline-style exceptions

Use `StyleSheet` or inline styles only for React Native-specific behavior that NativeWind cannot handle reliably, including:

- `SafeAreaView` compatibility and safe-area styling.
- `KeyboardAvoidingView`, `Modal`, and required native props.
- `ScrollView` props such as `contentContainerStyle` and `indicatorStyle`.
- `TextInput` props such as `underlineColorAndroid`.
- Animated values, complex transform arrays, runtime-calculated styles, pressed-state `style` callbacks, platform-specific styles, platform shadow differences, or explicit `zIndex` needs.
- Native `Button`, which cannot be visually customized; use `TouchableOpacity` or `Pressable` for custom buttons.

Do not use an exception as a reason to move ordinary static layout styling out of NativeWind.

### UI fidelity

When the user provides a design image, replicate it as closely as possible:

- Match layout, hierarchy, spacing, padding, typography, colors, border radii, shadows, alignment, proportions, and visible elements.
- Do not approximate, simplify, change the visual style, or omit visible elements unless the user explicitly asks.
- Keep layouts responsive across relevant phone sizes and preserve the design system.

## Images and generated assets

When image generation is enabled and a design reference is supplied, generate imagery that is visually identical or extremely close in style, color, composition, and design-system consistency.

Place generated assets in `assets/images/` with clear names, for example:

```text
assets/images/
  onboarding-illustration.png
  mascot-happy.png
```

Centralize image imports:

1. Check whether `constants/images.ts` exists.
2. If it does not, create it when image assets are first needed.
3. Import and export app images from that file.
4. Reference assets through the centralized `images` object rather than importing them directly inside screens or components, unless there is a strong reason.

## TypeScript and verification

- Use strict, simple, readable TypeScript.
- Avoid `any`; define focused types in `types/` when shared.
- Consider loading, empty, error, offline, edit, and delete states for data-driven flows.
- After code changes, run the relevant verification. Use `npm run lint` when feasible.
- Never claim a feature works without checking the applicable evidence.