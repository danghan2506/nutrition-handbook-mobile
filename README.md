# Aurale

A calm, intelligent, private nutrition companion for healthy daily eating.

Aurale is a personal health and nutrition tracking app built around Vietnamese daily eating habits. It helps you log meals, see how your calories and macronutrients compare with your personal targets, follow your weight trend, and get a gentle daily health score — with AI support for meal recognition and nutrition lookup.

## Overview

Aurale focuses on a supportive, judgement-free experience. It is a personal tool for logging and understanding your nutrition, not a diet prescription, not a clinician, and not an alarmist dashboard. Everything is designed around clarity, calm, and privacy: the AI is an assistive lookup and interpretation tool, and any AI-suggested nutrition data can be reviewed and edited before it is saved.

The interface is in Vietnamese and tuned to common meals. The visual direction uses a warm, restrained palette — warm charcoal, bone/ivory, muted sage, and terracotta — with generous whitespace and readable type.

## Key features

- **Authentication**: phone-number + OTP sign-in, plus social login (Supabase-backed).
- **Onboarding**: a gentle multi-step introduction that helps you start at your own pace.
- **Profile setup**: gender, height (ruler picker), current weight, activity level, and a nutrition goal that shape your daily targets.
- **Daily tracking**:
  - Log **breakfast, lunch, dinner, and snacks** — manually with your own food ("your own meal") or by entering macros for the meal.
  - **AI meal recognition** and **nutrition lookup** via photo or ingredient.
  - Daily totals for **calories, protein, carbs, fat, fiber, sugar, and sodium** compared against your daily targets.
  - A **daily healthy score** and simple message for the day's assessment.
- **Weeks at a glance**: pick any day of the week to view its meals, nutrition totals, and assessment.
- **Weight tracking**: record current weight and see gradual, contextual trends rather than daily noise.
- **Analytics (Explore)**:
  - Healthy score tracked over time.
  - Weekly trends charts for nutrition.
  - Nutrient details breakdown and top recommendations.
- **Meal reminders**: schedule gentle reminders for your meal times.
- **Profile settings**: edit your profile, review goals, and manage app settings.

## Product values

- **Supportive, never judgemental** — no shaming about food, calories, weight, or missed goals.
- **Human, not clinical** — calm language and gentle clarity over clinical or gym-bro tone.
- **Private by default** — health data is sensitive; the app only collects what a feature actually needs.
- **Accessible** — readable type, sufficient contrast, large touch targets, screen-reader labels, and status that isn't colour-only.

## Tech stack

- [Expo](https://expo.dev) SDK 54 (React Native `0.81`, React `19`)
- [Expo Router](https://docs.expo.dev/router/introduction/) v6 — file-based routing
- TypeScript (strict)
- [NativeWind](https://www.nativewind.dev) / Tailwind CSS — styling
- Zustand — light global state
- Expo SecureStore / AsyncStorage — local persistence
- Supabase — authentication
- Server-side API routes / backend functions for secrets, tokens, and AI calls — secrets never ship to the client

## Project structure

```text
app/
  (auth)/                    Sign-in with OTP & social login
  (protected)/               Profile editing, meal reminders, settings
  (tabs)/                   Home, Meals, Explore (analytics), Profile
  onboarding.tsx            Onboarding flow
  profile-setup.tsx         Profile & nutrition goal setup
  meal/                     Manual meal + AI meal recognition
components/                 Reusable UI components
constants/                  Theme tokens, images, and shared constants
data/                       Static or local data fixtures
hooks/                      Reusable React hooks
lib/                        Service clients and helpers (API, auth, analytics)
store/                      Zustand stores
types/                      Shared TypeScript types
assets/                     App icons and static assets
```

## Getting started

### Prerequisites

- Node.js (>= 20 recommended)
- npm
- A device/simulator with Expo Go, or a development build

### Install and run

```bash
npm install
npx expo start
```

Then press:

- `a` — Android emulator
- `i` — iOS simulator
- `w` — web
- Scan the QR code with Expo Go on a device

### Environment variables

The app connects to Supabase for authentication (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Public vars go in an `.env` file at the repo root. Any AI and secret-holding calls live on the server side, not in the mobile client — see [Supabase auth documentation](https://supabase.com/docs/guides/auth).

## Useful commands

| Command | Description |
| --- | --- |
| `npx expo start` | Start the development server |
| `npm run lint` | Run ESLint (Expo config) |
| `npx tsc --noEmit` | Type-check the project |
| `npm test` | Run Jest test suite |
| `npm run reset-project` | Reset the Expo starter project (not recommended once under development) |

## Project conventions

Before contributing, read [`AGENTS.md`](./AGENTS.md). It describes the product's principles, the approved tech stack, the folder architecture, the design language to follow, and the verification expected of every change (lint + type-check + tests).

## Contributing

Contributions are welcome. Please follow the flow in `AGENTS.md`: clarify the requirement first, keep changes focused and small, verify with type-check/lint/tests, and don't introduce new dependencies or backend/provider changes without explicit agreement.

## Overview disclaimer

Aurale is intended for general wellness and personal nutrition awareness. It is not medical advice, and the AI is an assistive lookup tool, not a doctor or dietitian. Always check food labels against trustworthy sources, confirm health concerns with a qualified professional, and treat trends, not single-day numbers, as the meaningful signal.