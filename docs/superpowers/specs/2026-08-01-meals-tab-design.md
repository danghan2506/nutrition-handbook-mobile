# Meals Tab Design

## Goal

Build the AURALE-style frontend for recording meals and browsing confirmed meals by day. The backend is not available yet, so the feature will use asynchronous mock services that conform to the API envelopes and data shapes documented in `Đồ Ăn Chuyên Ngành 2.pdf`.

The feature must support:

- catalog food search;
- user-created custom foods;
- AI meal recognition from a camera photo or an image-library selection;
- review and correction before any AI result becomes a meal;
- confirmation of a meal;
- daily meal history;
- updating the Home calorie-goal UI only after a meal is confirmed.

## Scope

### Included

- Create a new meal with a meal type and eaten time.
- Combine catalog, custom, and AI-detected items in one draft meal.
- Show confirmed meals for a selected date.
- Keep all mock data in memory for the current app session.
- Add a minimal Home calorie-goal presentation driven by confirmed meals.
- Model loading, empty, denied-permission, validation, AI-processing, AI-failure, retry, and confirmation states.

### Excluded

- Editing, deleting, or copying a confirmed meal.
- Barcode scanning and voice input.
- Persistent meal storage with AsyncStorage.
- Dark mode.
- Real network integration, authentication changes, backend changes, analytics, or AI-provider integration.
- Uploading an image for a custom food. Images are used only by AI meal recognition.

## Visual Direction

Follow `DESIGN.md`, not the dark reference screenshot.

- Use the Cloud Canvas, Clean Surface, Ink Navy, Soft Slate, Peach Tint, and Apricot Action roles already defined by AURALE.
- Keep the screen bright, calm, friendly, and mobile-first.
- Use readable type, generous spacing, 44 px minimum touch targets, and non-color-only state labels.
- Avoid dense dashboard cards, alarming calorie language, gradients, dark mode, and equal feature-card rows that compete for attention.

The reference screenshot informs the information hierarchy only.

## Main Meals Screen

The Meals tab is a hub, with this order:

1. Screen title and previous/next date controls.
2. A full-width food search field.
3. Two equal-size secondary action tiles:
   - `Tạo món của tôi` first;
   - `Nhận diện món ăn` second.
4. Confirmed meal history for the selected day, grouped or labeled by `BREAKFAST`, `LUNCH`, `DINNER`, and `SNACK`.

The Meals screen does not contain a calorie-goal card. A confirmed history row may show the meal's calorie total as descriptive meal data.

Searching begins after a trimmed query is present. Results show the food name, default serving, and a concise nutrition preview. Selecting a result adds it to the active meal draft and opens or returns to the meal composer.

## Navigation and Screens

- `app/(tabs)/meals.tsx`: Meals hub and daily history.
- `app/meals/create.tsx`: meal composer and final review for manual/custom items.
- `app/meals/custom-food.tsx`: custom-food form.
- `app/meals/ai-capture.tsx`: camera/library choice, permission handling, and image preview.
- `app/meals/ai-review/[analysisId].tsx`: AI processing and editable review.

Reusable UI belongs under `components/meals/`. Shared feature types belong under `types/`, API adapters under `lib/`, mock fixtures under `data/`, and shared client state under `store/`.

## Meal Composer

The composer owns the unconfirmed meal draft:

- meal type: `BREAKFAST`, `LUNCH`, `DINNER`, or `SNACK`;
- eaten time as an ISO 8601 timestamp with offset;
- one or more draft items;
- backend-derived nutrition previews returned by the mock service.

Users can add more items by search, custom food, or AI review. Each item shows its food name, serving, quantity, and returned nutrition. The primary action is `Xác nhận bữa ăn`. Confirmation is disabled until the meal metadata is valid and at least one item exists.

## Catalog Search

Mock the following documented contract:

- `GET /api/v1/foods?query=&page=&size=`
- `GET /api/v1/foods/{foodId}`

Search supports loading, an empty result, failure with retry, and pagination-compatible metadata. Nutrition and serving values displayed by the UI come from the mock response, not calculations embedded in components.

## Custom Food

The form captures:

- name;
- serving name;
- serving grams;
- calories, protein, carbohydrate, fat, fiber, sugar, and sodium per serving.

Mock `POST /api/v1/users/me/custom-foods`. Validate required names, `servingGrams > 0`, and non-negative nutrition values. On success, add the returned custom food to the current draft. The mock service assigns ownership and identifiers; the client does not send an owner ID.

The custom-food screen groups the fields into `Thông tin món ăn` (name, serving name, serving grams) and `Dinh dưỡng cho khẩu phần này` (calories, protein, carbohydrate, fat, fiber, sugar, and sodium). Every nutrient has a visible unit and inline validation. A compact summary lets the user verify that the values belong to the entered serving before submission.

## AI Image Flow

Use the approved `expo-image-picker` package for both `launchCameraAsync` and `launchImageLibraryAsync`; do not add `expo-camera` for this scope.

1. Let the user choose camera or image library.
2. Request only the permission needed for the selected action and explain a denial in plain language.
3. Accept JPEG, PNG, or WebP.
4. Reject unreadable/empty assets and assets over the configurable `MAX_IMAGE_BYTES`. The mock configuration initially uses 10 MB and must be changed to the backend Shared Contract value when that value becomes available.
5. Show an image preview with replace and continue actions.
6. Prepare `FormData` compatible with `POST /api/v1/meal-analyses`, with `image`, optional `mealType`, and optional `eatenAt`.
7. Generate and retain an idempotency key for retries of the same submission.
8. Mock `PENDING`, then `PROCESSING`, then either `REVIEW_REQUIRED` or `FAILED`.
9. Poll through the mock API interface so replacing the adapter with HTTP later does not change the screen.

The client never sends an analysis status or nutrition values as AI truth.

## AI Review and Confirmation

The review screen displays every detected item with:

- detected name;
- confidence expressed with text as well as a visual cue;
- mapping state;
- mapped food or candidates;
- serving and quantity;
- calories, protein, carbohydrate, fat, fiber, sugar, and sodium returned for the current mapping and portion.

The screen also displays the backend-derived nutrition total for the proposed meal. The user must review it before confirmation is enabled. Changing a mapping or portion refreshes this preview through the mock API. Catalog nutrition is corrected through food mapping and portion changes, not arbitrary client-supplied values. If the catalog values do not describe the meal, the user can replace the item with a custom food and enter its nutrition manually.

The user can replace a mapping, change a serving or quantity, omit an incorrect detected item, or add a catalog/custom item. The final state is sent through a mock of `PUT /api/v1/meal-analyses/{analysisId}/review`.

Confirmation mocks `POST /api/v1/meal-analyses/{analysisId}/confirm` with no request body and a retained idempotency key. Only a successful confirmation creates a meal and changes `REVIEW_REQUIRED` to `CONFIRMED`. Repeated confirmation returns the existing meal instead of creating a duplicate.

## Manual Meal Confirmation

Manual/catalog/custom drafts mock `POST /api/v1/meals`. The client sends meal metadata and references/quantities. The mock backend derives audit source and returns the official nutrition summary.

The UI must not treat client-computed values as authoritative. Any local sum is a preview; the confirmed response replaces it.

## State and Home Update

Use the approved `zustand` package for session-only state:

- current draft and its items;
- mock custom foods;
- AI analysis lifecycle;
- confirmed meals indexed by business date.

Do not persist this store.

The Home calorie selector sums `nutritionSummary.caloriesKcal` from confirmed meals for the current business date. The Home calorie-goal UI updates after successful manual meal creation or AI confirmation, never while a draft or AI analysis is pending. Goal language remains neutral and supportive, including when intake is above the target.

## API Boundary

Define a `MealApi` interface and two conceptual layers:

- `MockMealApi` used now;
- a future HTTP adapter using `EXPO_PUBLIC_API_BASE_URL` and the existing Supabase access token.

Components and stores depend on the interface, not mock fixtures. Responses use the shared envelope shape `{ data, error }` and pagination metadata where documented.

No real API URL, secret, provider token, or AI call is added to the mobile client.

## Error Handling

- Preserve search queries, form values, draft items, and selected images across retryable errors.
- Show field errors next to the affected control.
- Provide Settings guidance after camera/library permission is denied.
- Offer replace/retry actions for invalid, unsupported, or oversized images.
- When AI fails, offer a new image or the manual meal flow; never create a partial meal.
- Map expired/conflicting analyses to a fresh-analysis action.
- Use calm user-facing messages and keep internal error details out of the UI.

## Accessibility

- Every control and icon-only button has an accessible label.
- Permission, loading, mapping, and error states are not communicated by color alone.
- Inputs have visible labels, nutrition values include units, and touch targets are at least 44 px.
- Dynamic search and AI status changes are announced appropriately to screen readers.
- Motion respects reduced-motion preferences.

## Verification

Automated tests cover:

- mock contract envelopes and runtime response validation;
- search loading, results, empty, and error states;
- custom-food validation and successful draft insertion;
- image MIME/size validation and `FormData` preparation;
- denied camera/library permissions;
- AI state transitions, review edits, failure fallback, and idempotent confirmation;
- manual confirmation;
- daily history filtering;
- Home calories changing only after confirmation;
- accessibility labels and minimum supported layout assumptions.

Run targeted Jest tests, the full test suite when feasible, TypeScript checks, and `npm run lint`. Verify the feature in Expo Go first.

## Approved Dependencies

The user approved adding:

- `expo-image-picker`, installed with the Expo SDK-compatible installer;
- `zustand`.

No other dependency may be added without a new approval.
