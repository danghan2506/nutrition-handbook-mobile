# Meals Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AURALE Meals tab with mock-backed food search, custom-food nutrition entry, camera/library AI analysis, mandatory nutrition review, daily history, and confirmed-calorie updates on Home.

**Architecture:** Define the PDF-backed contracts behind a `MealApi` interface, implement an asynchronous in-memory adapter, and keep session-only draft/confirmed data in Zustand. Expo Router screens compose focused NativeWind components; swapping the mock adapter for HTTP later must not change route components.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, React 19.1, TypeScript 5.9, Expo Router 6, NativeWind 5 preview, Jest/`jest-expo`, approved `expo-image-picker ~17.0.11`, approved `zustand`.

## Global Constraints

- Read and follow Expo SDK 54 docs, especially `https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/`.
- Follow NativeWind v5 syntax from `https://www.nativewind.dev/v5/llms-full.txt`; use `className` for ordinary static layout.
- Follow `DESIGN.md`: Cloud Canvas, Clean Surface, Ink Navy, Soft Slate, Peach Tint, and Apricot Action; no dark Meals UI, gradients, punitive language, or touch targets below 44 px.
- Add only the approved `expo-image-picker` and `zustand` dependencies.
- Keep data in memory; do not add AsyncStorage or another persistence layer.
- Treat mock/backend responses as nutrition truth. AI output must be reviewable before confirmation, and the client must never submit catalog nutrition as audit truth.
- Support JPEG, PNG, and WebP; use configurable `MAX_IMAGE_BYTES = 10 * 1024 * 1024` until the backend Shared Contract supplies a different value.
- Keep existing unrelated user files and changes untouched.
- Run Expo Go first; do not create a native development build for this feature.

## File Map

- `types/meals.ts`: shared PDF-backed meal, food, analysis, and API envelope types.
- `constants/meals.ts`: meal labels, accepted image types, and image-size limit.
- `lib/meal-validation.ts`: pure custom-food, draft, and image validation.
- `lib/meal-upload.ts`: image-picker asset normalization and multipart construction.
- `lib/meal-api.ts`: `MealApi` interface and exported mock-backed client.
- `data/mock-meals.ts`: catalog fixtures and deterministic analysis fixtures.
- `store/meal-store.ts`: session-only Zustand draft, analyses, and confirmed meals.
- `hooks/use-food-search.ts`: cancellable/debounced search state.
- `hooks/use-meal-analysis.ts`: bounded polling state for a single analysis.
- `components/meals/*`: focused AURALE search, history, composer, nutrition, and AI review UI.
- `app/(tabs)/meals.tsx`: Meals hub.
- `app/meals/_layout.tsx`: nested stack configuration.
- `app/meals/create.tsx`: draft composer and manual confirmation.
- `app/meals/custom-food.tsx`: manual nutrition form and review summary.
- `app/meals/ai-capture.tsx`: camera/library permissions, preview, and mock upload.
- `app/meals/ai-review/[analysisId].tsx`: AI polling, nutrition review, correction, and confirmation.
- `components/home/home-calorie-goal.tsx`: Home goal UI driven only by confirmed meals.
- `__tests__/meal-*.ts(x)`: contract, service, store, route, and accessibility coverage.

---

### Task 1: Install Approved Packages and Define Contracts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app.json`
- Create: `types/meals.ts`
- Create: `constants/meals.ts`
- Create: `lib/meal-validation.ts`
- Test: `__tests__/meal-contract-test.ts`

**Interfaces:**
- Produces: `Nutrients`, `MealType`, `CatalogFood`, `CustomFood`, `MealDraft`, `Meal`, `MealAnalysis`, `SelectedMealImage`, `ApiEnvelope<T>`, `validateCustomFoodInput`, `validateMealDraft`, and `validateSelectedMealImage`.

- [ ] **Step 1: Write the failing contract and validation tests**

```ts
import { MAX_IMAGE_BYTES } from '@/constants/meals';
import { validateCustomFoodInput, validateSelectedMealImage } from '@/lib/meal-validation';

it('requires serving data and non-negative nutrients', () => {
  expect(validateCustomFoodInput({
    name: ' ', servingName: '', servingGrams: 0,
    nutritionPerServing: { caloriesKcal: -1, proteinG: 0, carbohydrateG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 },
  })).toMatchObject({ name: expect.any(String), servingName: expect.any(String), servingGrams: expect.any(String), caloriesKcal: expect.any(String) });
});

it('accepts only documented image MIME types below the configured limit', () => {
  expect(validateSelectedMealImage({ uri: 'file:///meal.jpg', fileName: 'meal.jpg', mimeType: 'image/jpeg', fileSize: MAX_IMAGE_BYTES })).toEqual({});
  expect(validateSelectedMealImage({ uri: 'file:///meal.heic', fileName: 'meal.heic', mimeType: 'image/heic', fileSize: 100 })).toHaveProperty('mimeType');
});
```

- [ ] **Step 2: Run the test and verify the missing modules fail**

Run: `npm test -- --runTestsByPath __tests__/meal-contract-test.ts`

Expected: FAIL because `@/constants/meals` and `@/lib/meal-validation` do not exist.

- [ ] **Step 3: Install only the approved dependencies**

Run:

```powershell
npx expo install expo-image-picker
npm install zustand
```

Expected: `expo-image-picker` resolves to the Expo SDK 54-compatible release (`~17.0.11` in current SDK 54 docs), and both lockfiles change only for these packages and their required transitive dependencies.

- [ ] **Step 4: Add privacy-preserving ImagePicker config**

Add this plugin entry to `app.json`:

```json
[
  "expo-image-picker",
  {
    "photosPermission": "Cho phép Nutrition Handbook truy cập ảnh để bạn chọn ảnh bữa ăn.",
    "cameraPermission": "Cho phép Nutrition Handbook sử dụng camera để bạn chụp ảnh bữa ăn.",
    "microphonePermission": false
  }
]
```

- [ ] **Step 5: Implement focused contract types and constants**

Use these exact discriminants and field names in `types/meals.ts`:

```ts
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type ReferenceType = 'CATALOG' | 'CUSTOM';
export type InputSource = 'AI_DETECTED' | 'MANUAL_SEARCH' | 'CUSTOM_ENTRY' | 'COPIED_FROM_MEAL';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'CONFIRMED' | 'FAILED' | 'EXPIRED';
export type MappingStatus = 'MAPPED' | 'REVIEW_REQUIRED' | 'UNMAPPED';

export interface Nutrients { caloriesKcal: number; proteinG: number; carbohydrateG: number; fatG: number; fiberG: number; sugarG: number; sodiumMg: number; }
export interface FoodServing { servingId: string; name: string; grams: number; }
export interface CatalogFood { foodId: string; name: string; matchedName: string; category: string; defaultServing: FoodServing; servings: FoodServing[]; nutritionPer100g: Nutrients; }
export interface CustomFoodInput { name: string; servingName: string; servingGrams: number; nutritionPerServing: Nutrients; }
export interface CustomFood extends CustomFoodInput { customFoodId: string; createdAt: string; updatedAt: string; }
export interface SelectedMealImage { uri: string; fileName: string | null; mimeType: string | null; fileSize: number | null; webFile?: File; }
export interface ApiError { code: string; message: string; fieldErrors: { field: string; code: string; message: string }[]; correlationId: string | null; }
export interface ApiEnvelope<T> { data: T | null; error: ApiError | null; }
export interface PageMeta { page: number; size: number; totalElements: number; totalPages: number; }
export interface FoodSearchEnvelope extends ApiEnvelope<CatalogFood[]> { meta: PageMeta; }
export interface MealDraftItem { draftItemId: string; referenceType: ReferenceType; foodId?: string; customFoodId?: string; analysisItemId?: string; foodName: string; servingId?: string; servingName: string; quantity: number; totalGrams: number; nutrition: Nutrients; }
export interface MealDraft { mealType: MealType; eatenAt: string; items: MealDraftItem[]; previewNutrition: Nutrients; }
export interface MealItem extends Omit<MealDraftItem, 'draftItemId'> { mealItemId: string; inputSource: InputSource; }
export interface Meal { mealId: string; mealType: MealType; eatenAt: string; businessDate: string; imageUrl: string | null; items: MealItem[]; nutritionSummary: Nutrients; healthyScore: { score: number; level: string } | null; createdAt: string; updatedAt: string; }
export interface AnalysisCandidate { foodId: string; name: string; matchScore: number; }
export interface AnalysisItem { analysisItemId: string; detectedName: string; confidence: number; estimatedGrams: number | null; mappingStatus: MappingStatus; mappedFood: { foodId: string; name: string } | null; candidates: AnalysisCandidate[]; servingId?: string; servingName?: string; quantity?: number; nutrition?: Nutrients; }
export interface MealAnalysis { analysisId: string; status: AnalysisStatus; mealType: MealType; eatenAt: string; items: AnalysisItem[]; nutritionSummary?: Nutrients; failure: { code: string; message: string } | null; createdAt: string; updatedAt: string; }
export interface CreateMealItemInput { referenceType: ReferenceType; foodId?: string; customFoodId?: string; servingId?: string; quantity: number; }
export interface CreateMealInput { mealType: MealType; eatenAt: string; items: CreateMealItemInput[]; }
export interface CreateAnalysisInput { image: SelectedMealImage; mealType?: MealType; eatenAt?: string; }
export interface ReviewAnalysisItemInput extends CreateMealItemInput { analysisItemId: string | null; }
export interface ReviewAnalysisInput { mealType: MealType; eatenAt: string; items: ReviewAnalysisItemInput[]; }
export interface ConfirmedAnalysis { analysisId: string; status: 'CONFIRMED'; meal: Meal; }
```

Keep all of these interfaces free of `any`. Client request types intentionally omit nutrition and `inputSource`; those fields exist only in preview/response types.

In `constants/meals.ts`, export:

```ts
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MEAL_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const mealTypeLabels = { BREAKFAST: 'Bữa sáng', LUNCH: 'Bữa trưa', DINNER: 'Bữa tối', SNACK: 'Bữa phụ' } as const;
```

- [ ] **Step 6: Implement pure validation and make tests pass**

Return `Record<string, string>` from each validator. Trim required strings, reject non-finite/negative nutrition, require `servingGrams > 0`, require at least one draft item, and reject missing MIME/size metadata safely.

Run: `npm test -- --runTestsByPath __tests__/meal-contract-test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```powershell
git add package.json package-lock.json app.json types/meals.ts constants/meals.ts lib/meal-validation.ts __tests__/meal-contract-test.ts
git commit -m "feat(meals): add contracts and image picker setup"
```

---

### Task 2: Build the Mock API Boundary

**Files:**
- Create: `data/mock-meals.ts`
- Create: `lib/meal-api.ts`
- Test: `__tests__/meal-api-test.ts`

**Interfaces:**
- Consumes: contract types from Task 1.
- Produces: `MealApi`, `MockMealApi`, `mealApi`, `createIdempotencyKey`, and deterministic mock calls used by stores/hooks.

- [ ] **Step 1: Write failing tests for search, custom food, lifecycle, and idempotency**

```ts
const api = new MockMealApi({ latencyMs: 0 });

it('returns catalog search in the documented envelope', async () => {
  const result = await api.searchFoods('cơm', 0, 20);
  expect(result).toMatchObject({ data: [expect.objectContaining({ foodId: expect.any(String), defaultServing: expect.any(Object), nutritionPer100g: expect.any(Object) })], meta: { page: 0, size: 20 }, error: null });
});

it('does not create two meals for one confirmation key', async () => {
  const first = await api.confirmAnalysis('analysis-ready', 'same-key');
  const second = await api.confirmAnalysis('analysis-ready', 'same-key');
  expect(second.data?.meal.mealId).toBe(first.data?.meal.mealId);
});
```

- [ ] **Step 2: Run the API tests and verify they fail**

Run: `npm test -- --runTestsByPath __tests__/meal-api-test.ts`

Expected: FAIL because `MockMealApi` does not exist.

- [ ] **Step 3: Define the exact API interface**

```ts
export interface MealApi {
  searchFoods(query: string, page?: number, size?: number, signal?: AbortSignal): Promise<FoodSearchEnvelope>;
  getFood(foodId: string, signal?: AbortSignal): Promise<ApiEnvelope<CatalogFood>>;
  createCustomFood(input: CustomFoodInput): Promise<ApiEnvelope<CustomFood>>;
  createMeal(input: CreateMealInput, idempotencyKey: string): Promise<ApiEnvelope<Meal>>;
  listMeals(date: string, signal?: AbortSignal): Promise<ApiEnvelope<Meal[]>>;
  createAnalysis(input: CreateAnalysisInput, idempotencyKey: string): Promise<ApiEnvelope<MealAnalysis>>;
  getAnalysis(analysisId: string, signal?: AbortSignal): Promise<ApiEnvelope<MealAnalysis>>;
  reviewAnalysis(analysisId: string, input: ReviewAnalysisInput): Promise<ApiEnvelope<MealAnalysis>>;
  confirmAnalysis(analysisId: string, idempotencyKey: string): Promise<ApiEnvelope<ConfirmedAnalysis>>;
}
```

`CreateMealInput` and `ReviewAnalysisInput` come from Task 1 and must remain free of nutrition or client-owned audit source.

Implement an injectable UUID-v4 key helper and create a key once per retry group:

```ts
export function createIdempotencyKey(random = Math.random): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}
```

- [ ] **Step 4: Implement deterministic fixtures and asynchronous behavior**

Create Vietnamese catalog fixtures for cơm trắng, thịt heo kho, rau luộc, phở bò, and bánh mì trứng. Also export typed `mockDraftItem` and `mockConfirmedMeal` fixtures for later store/integration tests. Implement `MockMealApi` with cloned return values, configurable latency, abort handling, `PENDING -> PROCESSING -> REVIEW_REQUIRED`, a seeded `analysis-ready` fixture, a seeded failure analysis, and per-key idempotency maps.

Use one explicit dependency instance:

```ts
export const mealApi: MealApi = new MockMealApi({ latencyMs: 250 });
```

- [ ] **Step 5: Run API tests**

Run: `npm test -- --runTestsByPath __tests__/meal-api-test.ts`

Expected: PASS for search envelopes, ownership-free custom input, lifecycle, abort identity, daily filtering, and idempotency.

- [ ] **Step 6: Commit Task 2**

```powershell
git add data/mock-meals.ts lib/meal-api.ts __tests__/meal-api-test.ts
git commit -m "feat(meals): add documented mock API"
```

---

### Task 3: Add Session-Only Meal State

**Files:**
- Create: `store/meal-store.ts`
- Test: `__tests__/meal-store-test.ts`

**Interfaces:**
- Consumes: `MealDraft`, `Meal`, `MealAnalysis`.
- Produces: `useMealStore`, `createMealStore`, `selectMealsForDate`, `selectConfirmedCaloriesForDate`.

- [ ] **Step 1: Write failing store tests**

```ts
import { mockConfirmedMeal, mockDraftItem } from '@/data/mock-meals';

it('does not count draft calories as confirmed Home calories', () => {
  const store = createMealStore();
  store.getState().startDraft('LUNCH', '2026-08-01T12:00:00+07:00');
  store.getState().addDraftItem(mockDraftItem);
  expect(selectConfirmedCaloriesForDate(store.getState(), '2026-08-01')).toBe(0);
  store.getState().addConfirmedMeal(mockConfirmedMeal);
  expect(selectConfirmedCaloriesForDate(store.getState(), '2026-08-01')).toBe(mockConfirmedMeal.nutritionSummary.caloriesKcal);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- --runTestsByPath __tests__/meal-store-test.ts`

Expected: FAIL because the store does not exist.

- [ ] **Step 3: Implement a testable vanilla store and bound hook**

State must expose these actions:

```ts
startDraft(mealType: MealType, eatenAt: string): void;
setDraftMetadata(mealType: MealType, eatenAt: string): void;
addDraftItem(item: MealDraftItem): void;
replaceDraftItem(itemId: string, item: MealDraftItem): void;
removeDraftItem(itemId: string): void;
clearDraft(): void;
upsertAnalysis(analysis: MealAnalysis): void;
addConfirmedMeal(meal: Meal): void;
```

Create the vanilla store with `createStore<MealState>()` and bind it with Zustand's `useStore`, so unit tests do not render React. Do not add persistence middleware.

- [ ] **Step 4: Run store tests**

Run: `npm test -- --runTestsByPath __tests__/meal-store-test.ts`

Expected: PASS for draft mutations, daily ordering, duplicate replacement by `mealId`, and confirmed-only calorie sums.

- [ ] **Step 5: Commit Task 3**

```powershell
git add store/meal-store.ts __tests__/meal-store-test.ts
git commit -m "feat(meals): add session meal store"
```

---

### Task 4: Build the Meals Hub, Search, and Daily History

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/meals.tsx`
- Create: `hooks/use-food-search.ts`
- Create: `components/meals/food-search-bar.tsx`
- Create: `components/meals/meal-action-tiles.tsx`
- Create: `components/meals/daily-meal-history.tsx`
- Test: `__tests__/meal-hub-test.tsx`

**Interfaces:**
- Consumes: `mealApi.searchFoods`, `startDraft`, `addDraftItem`, `selectMealsForDate`.
- Produces: visible `Bữa ăn` tab, search selection into a draft, equal action tiles ordered custom then AI, and date-filtered confirmed rows.

- [ ] **Step 1: Write failing component/source integration tests**

```ts
it('orders equal secondary actions after the search field', () => {
  const source = readFileSync(join(process.cwd(), 'app/(tabs)/meals.tsx'), 'utf8');
  expect(source.indexOf('<FoodSearchBar')).toBeLessThan(source.indexOf('<MealActionTiles'));
  expect(source).not.toContain('Mục tiêu calories');
});

it('labels the custom action before AI', () => {
  const source = readFileSync(join(process.cwd(), 'components/meals/meal-action-tiles.tsx'), 'utf8');
  expect(source.indexOf('Tạo món của tôi')).toBeLessThan(source.indexOf('Nhận diện món ăn'));
  expect(source).toContain('grid-cols-2');
});
```

- [ ] **Step 2: Run the hub test and verify it fails**

Run: `npm test -- --runTestsByPath __tests__/meal-hub-test.tsx`

Expected: FAIL because the Meals route/components do not exist.

- [ ] **Step 3: Add the Meals tab without rewriting unrelated screens**

In `app/(tabs)/_layout.tsx`, add a `meals` screen titled `Bữa ăn` with an accessible meal icon and AURALE active tint. Keep auth redirect behavior unchanged. Set the unfinished starter `explore` screen to `href: null` so it is not visible in the tab bar; do not delete its file.

- [ ] **Step 4: Implement search and history behavior**

`useFoodSearch(query)` waits 250 ms, aborts the prior call, and returns `{ results, status, error, retry }`. Empty trimmed queries return `idle` without calling the API.

The screen uses a `ScrollView` with `contentInsetAdjustmentBehavior="automatic"`, shows the full-width search first, then a two-column equal tile grid, then daily history. Search selection starts a draft with the current meal type inferred from local time, adds the catalog reference without an audit-source field, and routes to `/meals/create`; the mock backend returns `MANUAL_SEARCH` only in the confirmed response.

- [ ] **Step 5: Run hub tests and lint touched files**

Run:

```powershell
npm test -- --runTestsByPath __tests__/meal-hub-test.tsx
npm run lint
```

Expected: PASS; no TypeScript/ESLint errors in the new hub code.

- [ ] **Step 6: Commit Task 4**

```powershell
git add 'app/(tabs)/_layout.tsx' 'app/(tabs)/meals.tsx' hooks/use-food-search.ts components/meals/food-search-bar.tsx components/meals/meal-action-tiles.tsx components/meals/daily-meal-history.tsx __tests__/meal-hub-test.tsx
git commit -m "feat(meals): add search and daily history hub"
```

---

### Task 5: Build the Composer and Custom Nutrition Form

**Files:**
- Modify: `app/_layout.tsx`
- Create: `app/meals/_layout.tsx`
- Create: `app/meals/create.tsx`
- Create: `app/meals/custom-food.tsx`
- Create: `components/meals/meal-draft-list.tsx`
- Create: `components/meals/nutrition-summary.tsx`
- Create: `components/meals/custom-food-form.tsx`
- Test: `__tests__/meal-custom-food-test.tsx`
- Test: `__tests__/meal-composer-test.tsx`

**Interfaces:**
- Consumes: Task 1 validators, `mealApi.createCustomFood`, `mealApi.createMeal`, and Task 3 actions.
- Produces: manual meal confirmation and an explicit 7-nutrient custom-food review flow.

- [ ] **Step 1: Write failing tests for required fields and review copy**

```ts
it('shows all seven nutrients with units before saving', () => {
  const source = readFileSync(join(process.cwd(), 'components/meals/custom-food-form.tsx'), 'utf8');
  for (const label of ['Năng lượng', 'Protein', 'Carbohydrate', 'Chất béo', 'Chất xơ', 'Đường', 'Natri']) expect(source).toContain(label);
  for (const unit of ['kcal', 'g', 'mg']) expect(source).toContain(unit);
  expect(source).toContain('Kiểm tra thông tin');
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --runTestsByPath __tests__/meal-custom-food-test.tsx __tests__/meal-composer-test.tsx`

Expected: FAIL because the routes/components do not exist.

- [ ] **Step 3: Add the nested Meals stack**

Use `app/meals/_layout.tsx` with `Stack` screens titled `Xem lại bữa ăn`, `Tạo món của tôi`, `Ảnh bữa ăn`, and `Kiểm tra kết quả`. Register the nested stack in `app/_layout.tsx` with `headerShown: false`.

- [ ] **Step 4: Implement the custom-food form as two sections**

Section `Thông tin món ăn` contains name, serving name, and serving grams. Section `Dinh dưỡng cho khẩu phần này` contains the seven numeric fields. Parse inputs on submit, show inline errors from `validateCustomFoodInput`, then show a compact review summary. A second explicit action calls `createCustomFood`; success adds the returned custom item to the draft and routes to the composer. Preserve form values on mock failure.

- [ ] **Step 5: Implement manual composer confirmation**

The composer displays meal type, eaten time, draft items, per-item nutrition, backend-preview total, and links to search/custom/AI additions. Generate one idempotency key per confirmation attempt group. On successful `createMeal`, call `addConfirmedMeal`, clear the draft, and return to `/meals`. On failure, keep the draft and expose `Thử lại`.

- [ ] **Step 6: Run the focused tests**

Run: `npm test -- --runTestsByPath __tests__/meal-custom-food-test.tsx __tests__/meal-composer-test.tsx`

Expected: PASS for validation, two-step review, retry preservation, one-primary-action rule, and confirmed-only storage.

- [ ] **Step 7: Commit Task 5**

```powershell
git add app/_layout.tsx app/meals components/meals/meal-draft-list.tsx components/meals/nutrition-summary.tsx components/meals/custom-food-form.tsx __tests__/meal-custom-food-test.tsx __tests__/meal-composer-test.tsx
git commit -m "feat(meals): add composer and custom nutrition entry"
```

---

### Task 6: Add Camera, Library Selection, Validation, and Multipart Preparation

**Files:**
- Create: `lib/meal-upload.ts`
- Create: `app/meals/ai-capture.tsx`
- Create: `components/meals/meal-image-preview.tsx`
- Test: `__tests__/meal-upload-test.ts`
- Test: `__tests__/meal-ai-capture-test.tsx`

**Interfaces:**
- Consumes: `SelectedMealImage`, image constants, `mealApi.createAnalysis`.
- Produces: `normalizePickedAsset`, `createMealAnalysisFormData`, camera/library entry, preview, replace, upload, and retry.

- [ ] **Step 1: Write failing multipart tests**

```ts
it('builds the documented multipart field names', () => {
  const form = createMealAnalysisFormData({ uri: 'file:///meal.jpg', fileName: 'meal.jpg', mimeType: 'image/jpeg', fileSize: 1024 }, 'LUNCH', '2026-08-01T12:30:00+07:00');
  expect(Array.from(form.keys())).toEqual(['image', 'mealType', 'eatenAt']);
});
```

- [ ] **Step 2: Verify upload tests fail**

Run: `npm test -- --runTestsByPath __tests__/meal-upload-test.ts __tests__/meal-ai-capture-test.tsx`

Expected: FAIL because upload helpers and capture route do not exist.

- [ ] **Step 3: Implement asset normalization and multipart construction**

Use `ImagePickerAsset.file` on web when available. On native append `{ uri, name, type }` with the narrow React Native `FormData` cast contained in `meal-upload.ts`; do not spread the cast into screens. Never add base64 to state.

- [ ] **Step 4: Implement camera and library actions**

For camera: call `requestCameraPermissionsAsync`, then `launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8, cameraType: ImagePicker.CameraType.back })` only after a button press.

For the library: call `launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8, selectionLimit: 1 })` after a button press; do not pre-request broad library access where the system picker does not require it.

Normalize the first asset, validate MIME/size, show a preview, allow replace, and retain the same idempotency key when retrying a failed mock upload. On accepted creation, upsert the analysis and route to `/meals/ai-review/{analysisId}`.

- [ ] **Step 5: Cover Android recovery and denial copy**

On mount, check `ImagePicker.getPendingResultAsync()` and process a recovered non-canceled image. For `canAskAgain: false`, show a calm explanation and a button using `Linking.openSettings()`. Cancellation is not an error.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- --runTestsByPath __tests__/meal-upload-test.ts __tests__/meal-ai-capture-test.tsx`

Expected: PASS for camera denial, canceled selection, HEIC rejection, size rejection, pending Android result, preview replacement, field names, and retained retry key.

- [ ] **Step 7: Commit Task 6**

```powershell
git add lib/meal-upload.ts app/meals/ai-capture.tsx components/meals/meal-image-preview.tsx __tests__/meal-upload-test.ts __tests__/meal-ai-capture-test.tsx
git commit -m "feat(meals): add meal image capture and upload preparation"
```

---

### Task 7: Build AI Polling, Nutrition Review, Correction, and Confirmation

**Files:**
- Create: `lib/meal-review.ts`
- Create: `hooks/use-meal-analysis.ts`
- Create: `app/meals/ai-review/[analysisId].tsx`
- Create: `components/meals/analysis-status.tsx`
- Create: `components/meals/ai-review-item.tsx`
- Create: `components/meals/ai-nutrition-review.tsx`
- Test: `__tests__/meal-ai-review-test.tsx`

**Interfaces:**
- Consumes: `mealApi.getAnalysis`, `reviewAnalysis`, `confirmAnalysis`, store analysis/draft/confirmed actions.
- Produces: `ReviewDraft`, `buildReviewRequest`, bounded polling, and explicit review acknowledgement before confirm.

- [ ] **Step 1: Write failing lifecycle and nutrition-review tests**

```ts
import { buildReviewRequest } from '@/lib/meal-review';

it('shows seven nutrient values and requires review acknowledgement', () => {
  const source = readFileSync(join(process.cwd(), 'components/meals/ai-nutrition-review.tsx'), 'utf8');
  for (const key of ['caloriesKcal', 'proteinG', 'carbohydrateG', 'fatG', 'fiberG', 'sugarG', 'sodiumMg']) expect(source).toContain(key);
  expect(source).toContain('Tôi đã kiểm tra thông tin dinh dưỡng');
});

it('does not send nutrition in the review request', async () => {
  const request = buildReviewRequest({
    mealType: 'LUNCH',
    eatenAt: '2026-08-01T12:30:00+07:00',
    items: [{ analysisItemId: 'ai-1', referenceType: 'CATALOG', foodId: 'food-rice', servingId: 'serving-rice-bowl', quantity: 1, nutrition: { caloriesKcal: 234, proteinG: 4.9, carbohydrateG: 50.8, fatG: 0.5, fiberG: 0.7, sugarG: 0.2, sodiumMg: 2 } }],
  });
  expect(JSON.stringify(request)).not.toContain('caloriesKcal');
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- --runTestsByPath __tests__/meal-ai-review-test.tsx`

Expected: FAIL because AI review modules do not exist.

- [ ] **Step 3: Implement bounded polling**

`useMealAnalysis(analysisId)` fetches immediately, polls every 1.5 seconds only for `PENDING`/`PROCESSING`, aborts on unmount or ID change, stops on terminal states, and exposes manual retry. Do not keep a timer after `REVIEW_REQUIRED`, `FAILED`, `CONFIRMED`, or `EXPIRED`.

In `lib/meal-review.ts`, define `ReviewDraft` as the editable response state (including preview nutrition), and implement `buildReviewRequest(review: ReviewDraft): ReviewAnalysisInput` by returning only `mealType`, `eatenAt`, item references, `analysisItemId`, serving IDs, and quantities.

- [ ] **Step 4: Implement editable AI review**

Each detected item displays name, text confidence, mapping state, selected catalog/custom reference, portion controls, and all seven backend-returned nutrients. Candidate selection and portion changes call `reviewAnalysis` and replace the preview from its response. Omitting an item removes it from the outgoing list. Unmapped values provide search/custom replacement actions.

Display total meal calories and macros first, with fiber, sugar, and sodium in the same review section. Require a checkbox labeled `Tôi đã kiểm tra thông tin dinh dưỡng`; disable `Xác nhận bữa ăn` until checked and at least one valid item exists.

- [ ] **Step 5: Implement safe confirmation and fallback**

Generate one confirm idempotency key and retain it across retries. On success add the returned meal, clear the related analysis/draft state, and navigate to `/meals`. `FAILED` offers `Chọn ảnh khác` and `Nhập thủ công`; `EXPIRED` starts a new capture; conflict reloads analysis; no failure creates a meal.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- --runTestsByPath __tests__/meal-ai-review-test.tsx`

Expected: PASS for polling cleanup, mapped/unmapped display, seven nutrients, refreshed preview, acknowledgement gate, omission, manual fallback, and idempotent confirmation.

- [ ] **Step 7: Commit Task 7**

```powershell
git add lib/meal-review.ts hooks/use-meal-analysis.ts 'app/meals/ai-review/[analysisId].tsx' components/meals/analysis-status.tsx components/meals/ai-review-item.tsx components/meals/ai-nutrition-review.tsx __tests__/meal-ai-review-test.tsx
git commit -m "feat(meals): add AI nutrition review and confirmation"
```

---

### Task 8: Update Home from Confirmed Meals and Verify the Feature

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `components/home/home-calorie-goal.tsx`
- Test: `__tests__/home-calorie-goal-test.tsx`
- Test: `__tests__/meal-flow-test.ts`

**Interfaces:**
- Consumes: `selectConfirmedCaloriesForDate` and confirmed meal store state.
- Produces: supportive Home calorie-goal UI that changes only after confirmation.

- [ ] **Step 1: Write the failing Home integration test**

```ts
import { mockConfirmedMeal, mockDraftItem } from '@/data/mock-meals';

it('updates Home calories only from confirmed meals', () => {
  const store = createMealStore();
  store.getState().startDraft('LUNCH', '2026-08-01T12:00:00+07:00');
  store.getState().addDraftItem(mockDraftItem);
  expect(selectConfirmedCaloriesForDate(store.getState(), '2026-08-01')).toBe(0);
  store.getState().addConfirmedMeal(mockConfirmedMeal);
  expect(selectConfirmedCaloriesForDate(store.getState(), '2026-08-01')).toBe(620);
});
```

- [ ] **Step 2: Verify the Home test fails for missing UI integration**

Run: `npm test -- --runTestsByPath __tests__/home-calorie-goal-test.tsx __tests__/meal-flow-test.ts`

Expected: FAIL because Home still contains starter UI and no calorie-goal component.

- [ ] **Step 3: Replace only the starter Home content needed by this feature**

Render `HomeCalorieGoal` on Cloud Canvas. Read today's confirmed calories with a selector and reuse the already documented mock range from `mockDailyAssessment.targets.caloriesKcal` (`min: 1800`, `max: 2100`) instead of inventing a new nutrition target. Show `Đã ghi {consumed} kcal` and `Mục tiêu hôm nay {min}–{max} kcal`; above the range, use neutral copy such as `Bạn đã ghi đầy đủ hơn cho hôm nay` rather than warning red or punishment language.

Do not add nutrition calculations, persistence, or profile target changes.

- [ ] **Step 4: Add accessibility and cross-flow assertions**

Test accessible labels for date controls, search, action tiles, numeric inputs, permission actions, retry actions, review checkbox, and confirm buttons. Assert `min-h-[44px]` or equivalent for touch controls and verify that color is never the only AI/mapping/error cue.

- [ ] **Step 5: Run complete verification**

Run:

```powershell
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

Expected: all Jest suites pass, TypeScript exits 0, lint exits 0, and Expo web export completes without route or bundle errors.

Then run `npx expo start`, open the project in Expo Go, and manually verify on a phone:

1. Search and add a catalog food.
2. Enter and review a custom food with all seven nutrients.
3. Deny then grant camera permission.
4. Capture and select a supported image.
5. Reject an unsupported or oversized fixture.
6. Observe processing, correct an AI item, review nutrition, and confirm.
7. Confirm daily history changes only after success.
8. Confirm Home calories change only after success.

- [ ] **Step 6: Commit Task 8**

```powershell
git add 'app/(tabs)/index.tsx' components/home/home-calorie-goal.tsx __tests__/home-calorie-goal-test.tsx __tests__/meal-flow-test.ts
git commit -m "feat(home): reflect confirmed meal calories"
```

---

## Final Review Gate

- [ ] Compare every implementation task against `docs/superpowers/specs/2026-08-01-meals-tab-design.md`.
- [ ] Confirm no edit/delete/copy, barcode, voice, AsyncStorage, real backend, or custom-food image scope slipped in.
- [ ] Confirm only `expo-image-picker` and `zustand` were added.
- [ ] Confirm AI and catalog nutrition cannot be silently saved without review.
- [ ] Confirm `git status --short` contains no unrelated staged files.
