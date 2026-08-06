# Design Spec: Custom Food & Multi-Item Meal Builder Flow

- **Date**: 2026-08-06
- **Status**: Approved
- **Scope**: Core MVP Meal Tracking & Custom Food Creation (`app/meal/create.tsx`)

---

## 1. Executive Summary

This design document defines the complete UI/UX and API interaction specification for creating custom foods and building multi-item meals in the Nutrition Handbook mobile application. The implementation adheres strictly to the app's established design system (Warm Ivory `#FAF7F2`, Warm Charcoal `#2A2E37`, Peach `#FFF0E7`, Terracotta `#E87A5D`, Muted Sage `#8A9A86`).

---

## 2. User Experience & Interaction Specifications

### 2.1. Meal Builder Screen (`app/meal/create.tsx`)
- **Header**: Back arrow `<`, date/time selector (`Hôm nay · 10:00 ▾`), and info button `ⓘ`.
- **Search Bar**: Live input bar `"Tìm thực phẩm hoặc món ăn"` with barcode scanner icon.
- **Quick Action Chips**: Horizontal scrollable chips:
  - `[🔍 Catalog]`
  - `[✏️ + Nhập món mới]`
  - `[⭐ Món tủ của tôi]`
  - `[📋 Bữa ăn gần đây]`
- **Food List**: Live food cards with macro indicators (`⚡ 0g 🌿 0g 💧 0g`) and a `[+]` button to append items to the meal draft.

### 2.2. Custom Food Sheet (`components/meal/custom-food-sheet.tsx`)
- Opened via the `[✏️ + Nhập món mới]` action chip.
- **Integrated Meal Type Selector (`mealType`)**: Segmented control inside the sheet with options: `Bữa Sáng`, `Bữa Trưa`, `Bữa Tối`, `Bữa Phụ`. Default is pre-selected based on current time or user context.
- **Form Inputs**:
  - `name`: Food name (e.g., *"Bún chả Hà Nội"*).
  - `servingName`: Portion unit name (e.g., *"1 tô"*).
  - `servingGrams`: Numeric weight in grams (> 0).
  - 7 Nutritional values per serving: `caloriesKcal`, `proteinG`, `carbohydrateG`, `fatG`, `fiberG`, `sugarG`, `sodiumMg`.
- **API persisted**: On submitting *"Lưu món & Thêm vào bữa ăn"*, calls `POST /api/v1/users/me/custom-foods` to obtain `customFoodId`, then appends the item into the active meal draft.

### 2.3. Meal Item Cards & Interaction Rules
- **Default Quantity**: Every item added to the meal draft initializes with `quantity = 1`.
- **Quantity Stepper**: Stepper buttons `[ - 1 + ]` allow adjusting quantity.
- **Removal of Static Delete Icon**: Static `✕` delete buttons are removed from item cards.
- **Swipe-Left to Delete**:
  - Swiping an item card to the **left** (`Swipe Left`) reveals a red action area with a white trash icon `🗑️`.
  - Tapping the trash icon triggers a confirmation Alert dialog:
    > *"Bạn có chắc chắn muốn xóa món [Tên món] khỏi bữa ăn không?"*
    > `[Hủy]` • `[Xóa]`
  - Confirming deletion removes the item from the draft and updates total nutrition values in real time.

### 2.4. Docked Bottom Action Bar & API Contract
- **Real-Time Summary**: Floating/docked bottom bar displays aggregate totals for Calories and Macros (Protein, Carb, Fat).
- **Primary CTA**: *"Ghi nhận Bữa ăn (N món)"*.
- **API Request**: Submits `POST /api/v1/meals`:
  - **Headers**: `Authorization: Bearer <token>`, `Idempotency-Key: <uuid>`.
  - **Payload**:
    ```json
    {
      "mealType": "LUNCH",
      "eatenAt": "2026-07-28T12:30:00+07:00",
      "items": [
        {
          "referenceType": "CUSTOM",
          "customFoodId": "custom-uuid-123",
          "quantity": 1
        }
      ]
    }
    ```
  - **Note**: Client does NOT transmit `inputSource` (Backend automatically infers `CUSTOM_ENTRY` or `MANUAL_SEARCH`).

---

## 3. Data Flow Diagram

```
[User Taps "+ Nhập món mới"]
           │
           ▼
[Custom Food Sheet Opens]
 (Selects mealType: LUNCH, inputs 7 nutrients)
           │
           ▼
[POST /api/v1/users/me/custom-foods] ──► Returns customFoodId
           │
           ▼
[Appends Item to Meal Draft (quantity = 1)]
           │
 ┌─────────┴─────────┐
 ▼                   ▼
[Adjust Quantity]  [Swipe Right -> Trash Icon -> Alert Confirm Delete]
 [ - 1 + ]           (Deletes item from draft)
           │
           ▼
[Tap "Ghi nhận Bữa ăn"]
           │
           ▼
[POST /api/v1/meals with Idempotency-Key & ISO8601 Offset]
```

---

## 4. Verification & Testing Criteria

1. **Custom Food Persist**: Check that creating a custom food calls `POST /api/v1/users/me/custom-foods` and receives a valid `customFoodId`.
2. **Default Quantity = 1**: Verify that newly added items always start with quantity 1.
3. **Swipe-Right & Delete Alert**: Verify that swiping right reveals the red trash container, and tapping trash shows an Alert prompt before removing the item.
4. **Idempotency & Timezone**: Verify `Idempotency-Key` UUID header and ISO 8601 offset in `eatenAt`.
