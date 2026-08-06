import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomFoodSheet } from '@/components/meal/custom-food-sheet';
import { SwipeableMealItem } from '@/components/meal/swipeable-meal-item';
import { mealTypeLabels } from '@/constants/meals';
import { mockCatalogFoods } from '@/data/mock-meals';
import { createIdempotencyKey, mealApi } from '@/lib/meal-api';
import { useMealsStore } from '@/store/use-meals-store';
import type {
  CatalogFood,
  CreateMealItemInput,
  CustomFood,
  MealDraftItem,
  MealType,
  Nutrients,
} from '@/types/meals';

const colors = {
  canvas: '#FFF9F0',
  surface: '#FFFFFF',
  ink: '#2F3542',
  slate: '#697386',
  apricot: '#FF9E7A',
  peach: '#FFF0E7',
  border: '#E9E1D8',
};

type FilterChip = 'CATALOG' | 'FAVORITES' | 'RECENT';

export default function CreateMealScreen() {
  const params = useLocalSearchParams<{ foodId?: string; date?: string; mealType?: MealType }>();

  const [mealType, setMealType] = useState<MealType>(params.mealType ?? 'LUNCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<FilterChip>('CATALOG');
  const [customSheetVisible, setCustomSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFoodsList, setCustomFoodsList] = useState<CustomFood[]>([]);

  // Initialize draft items with foodId param if present
  const [draftItems, setDraftItems] = useState<MealDraftItem[]>(() => {
    if (params.foodId) {
      const initialFood = mockCatalogFoods.find((f) => f.foodId === params.foodId);
      if (initialFood) {
        const ratio = initialFood.defaultServing.grams / 100;
        const unitNutrients: Nutrients = {
          caloriesKcal: Math.round(initialFood.nutritionPer100g.caloriesKcal * ratio),
          proteinG: Math.round(initialFood.nutritionPer100g.proteinG * ratio * 10) / 10,
          carbohydrateG: Math.round(initialFood.nutritionPer100g.carbohydrateG * ratio * 10) / 10,
          fatG: Math.round(initialFood.nutritionPer100g.fatG * ratio * 10) / 10,
          fiberG: Math.round(initialFood.nutritionPer100g.fiberG * ratio * 10) / 10,
          sugarG: Math.round(initialFood.nutritionPer100g.sugarG * ratio * 10) / 10,
          sodiumMg: Math.round(initialFood.nutritionPer100g.sodiumMg * ratio * 10) / 10,
        };
        return [
          {
            draftItemId: `draft-init-${Date.now()}`,
            referenceType: 'CATALOG',
            foodId: initialFood.foodId,
            foodName: initialFood.name,
            servingId: initialFood.defaultServing.servingId,
            servingName: initialFood.defaultServing.name,
            quantity: 1,
            totalGrams: initialFood.defaultServing.grams,
            nutrition: unitNutrients,
          },
        ];
      }
    }
    return [];
  });

  const appendMeal = useMealsStore((state) => state.appendMeal);
  const storeMeals = useMealsStore((state) => state.meals);

  // Live filter available catalog foods
  const filteredCatalogFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockCatalogFoods;
    return mockCatalogFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.matchedName.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Live filter custom foods
  const filteredCustomFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customFoodsList;
    return customFoodsList.filter((cf) => cf.name.toLowerCase().includes(q));
  }, [searchQuery, customFoodsList]);

  // Recent foods from meals store
  const recentFoods = useMemo(() => {
    const itemsList: { foodName: string; servingName: string; caloriesKcal: number; item: Omit<MealDraftItem, 'draftItemId'> }[] = [];
    storeMeals.forEach((m) => {
      m.items.forEach((item) => {
        if (!itemsList.some((x) => x.foodName === item.foodName)) {
          itemsList.push({
            foodName: item.foodName,
            servingName: item.servingName,
            caloriesKcal: item.nutrition.caloriesKcal,
            item: {
              referenceType: item.referenceType,
              foodId: item.foodId,
              customFoodId: item.customFoodId,
              foodName: item.foodName,
              servingId: item.servingId,
              servingName: item.servingName,
              quantity: 1,
              totalGrams: item.totalGrams,
              nutrition: item.nutrition,
            },
          });
        }
      });
    });
    return itemsList;
  }, [storeMeals]);

  // Calculate real-time aggregate nutrition summary
  const totalNutrition = useMemo(() => {
    return draftItems.reduce<Nutrients>(
      (acc, item) => ({
        caloriesKcal: acc.caloriesKcal + Math.round((item.nutrition.caloriesKcal ?? 0) * item.quantity),
        proteinG: Math.round((acc.proteinG + (item.nutrition.proteinG ?? 0) * item.quantity) * 10) / 10,
        carbohydrateG: Math.round((acc.carbohydrateG + (item.nutrition.carbohydrateG ?? 0) * item.quantity) * 10) / 10,
        fatG: Math.round((acc.fatG + (item.nutrition.fatG ?? 0) * item.quantity) * 10) / 10,
        fiberG: Math.round((acc.fiberG + (item.nutrition.fiberG ?? 0) * item.quantity) * 10) / 10,
        sugarG: Math.round((acc.sugarG + (item.nutrition.sugarG ?? 0) * item.quantity) * 10) / 10,
        sodiumMg: Math.round((acc.sodiumMg + (item.nutrition.sodiumMg ?? 0) * item.quantity) * 10) / 10,
      }),
      { caloriesKcal: 0, proteinG: 0, carbohydrateG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 }
    );
  }, [draftItems]);

  const addCatalogFoodToDraft = (food: CatalogFood) => {
    const existingIndex = draftItems.findIndex((item) => item.foodId === food.foodId);
    if (existingIndex >= 0) {
      setDraftItems((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      const ratio = food.defaultServing.grams / 100;
      const unitNutrients: Nutrients = {
        caloriesKcal: Math.round(food.nutritionPer100g.caloriesKcal * ratio),
        proteinG: Math.round(food.nutritionPer100g.proteinG * ratio * 10) / 10,
        carbohydrateG: Math.round(food.nutritionPer100g.carbohydrateG * ratio * 10) / 10,
        fatG: Math.round(food.nutritionPer100g.fatG * ratio * 10) / 10,
        fiberG: Math.round(food.nutritionPer100g.fiberG * ratio * 10) / 10,
        sugarG: Math.round(food.nutritionPer100g.sugarG * ratio * 10) / 10,
        sodiumMg: Math.round(food.nutritionPer100g.sodiumMg * ratio * 10) / 10,
      };

      const newItem: MealDraftItem = {
        draftItemId: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        referenceType: 'CATALOG',
        foodId: food.foodId,
        foodName: food.name,
        servingId: food.defaultServing.servingId,
        servingName: food.defaultServing.name,
        quantity: 1,
        totalGrams: food.defaultServing.grams,
        nutrition: unitNutrients,
      };
      setDraftItems((prev) => [...prev, newItem]);
    }
  };

  const addCustomFoodToDraft = (customFood: CustomFood) => {
    const existingIndex = draftItems.findIndex((item) => item.customFoodId === customFood.customFoodId);
    if (existingIndex >= 0) {
      setDraftItems((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      const newItem: MealDraftItem = {
        draftItemId: `draft-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        referenceType: 'CUSTOM',
        customFoodId: customFood.customFoodId,
        foodName: customFood.name,
        servingName: customFood.servingName,
        quantity: 1,
        totalGrams: customFood.servingGrams,
        nutrition: customFood.nutritionPerServing,
      };
      setDraftItems((prev) => [...prev, newItem]);
    }
  };

  const addRecentItemToDraft = (rf: { foodName: string; item: Omit<MealDraftItem, 'draftItemId'> }) => {
    const existingIndex = draftItems.findIndex(
      (item) =>
        (rf.item.foodId && item.foodId === rf.item.foodId) ||
        (rf.item.customFoodId && item.customFoodId === rf.item.customFoodId) ||
        item.foodName === rf.foodName
    );
    if (existingIndex >= 0) {
      setDraftItems((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      const newItem: MealDraftItem = {
        ...rf.item,
        draftItemId: `draft-recent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      setDraftItems((prev) => [...prev, newItem]);
    }
  };

  const handleCustomFoodAdded = (customFood: CustomFood, selectedMealType: MealType) => {
    setMealType(selectedMealType);
    setCustomFoodsList((prev) => [customFood, ...prev]);
    addCustomFoodToDraft(customFood);
  };

  const handleQuantityChange = (draftItemId: string, newQuantity: number) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.draftItemId === draftItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleDeleteItem = (draftItemId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.draftItemId !== draftItemId));
  };

  const handleOpenMealTypePicker = () => {
    Alert.alert(
      'Chọn loại bữa ăn',
      'Chọn bữa ăn bạn muốn ghi nhận:',
      [
        { text: 'Bữa sáng 🍳', onPress: () => setMealType('BREAKFAST') },
        { text: 'Bữa trưa 🍱', onPress: () => setMealType('LUNCH') },
        { text: 'Bữa tối 🍲', onPress: () => setMealType('DINNER') },
        { text: 'Bữa phụ 🥪', onPress: () => setMealType('SNACK') },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  const handleInfoPress = () => {
    Alert.alert(
      'Hướng dẫn tạo bữa ăn',
      '• Tìm kiếm thực phẩm từ thư viện hoặc tự nhập món mới.\n• Nhấn nút [+] để thêm món vào bữa ăn.\n• Vuốt sang trái thẻ món ăn để xóa.\n• Thay đổi số lượng khẩu phần trực tiếp trên thẻ.\n• Bấm "Ghi nhận Bữa ăn" để hoàn tất.',
      [{ text: 'Đã hiểu' }]
    );
  };

  const handleBarcodePress = () => {
    Alert.alert(
      'Quét mã vạch',
      'Tính năng quét mã vạch bao bì thực phẩm đang được phát triển.',
      [{ text: 'Đóng' }]
    );
  };

  const handleCreateMeal = async () => {
    if (draftItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const now = new Date();
      if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
        const [year, month, day] = params.date.split('-').map(Number);
        now.setFullYear(year, month - 1, day);
      }

      const pad = (n: number) => (n < 10 ? '0' : '') + Math.floor(Math.abs(n));
      const offset = -now.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const eatenAt =
        now.getFullYear() +
        '-' +
        pad(now.getMonth() + 1) +
        '-' +
        pad(now.getDate()) +
        'T' +
        pad(now.getHours()) +
        ':' +
        pad(now.getMinutes()) +
        ':' +
        pad(now.getSeconds()) +
        sign +
        pad(offset / 60) +
        ':' +
        pad(offset % 60);

      const items: CreateMealItemInput[] = draftItems.map((item) => ({
        referenceType: item.referenceType,
        foodId: item.foodId,
        customFoodId: item.customFoodId,
        servingId: item.servingId,
        quantity: item.quantity,
      }));

      const response = await mealApi.createMeal(
        {
          mealType,
          eatenAt,
          items,
        },
        createIdempotencyKey()
      );

      if (response.data) {
        appendMeal(response.data);
        router.back();
      } else {
        Alert.alert('Không thể ghi lại bữa ăn', response.error?.message ?? 'Đã xảy ra lỗi khi tạo bữa ăn.');
      }
    } catch {
      Alert.alert('Lỗi hệ thống', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Quay lại"
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons color={colors.ink} name="chevron-back" size={24} />
            </Pressable>

            <Pressable
              accessibilityLabel="Chọn loại bữa ăn"
              accessibilityRole="button"
              style={styles.dropdownBtn}
              onPress={handleOpenMealTypePicker}
            >
              <Text style={styles.dropdownTitle}>
                {mealTypeLabels[mealType]} · Hôm nay ▾
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Thông tin hướng dẫn"
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={handleInfoPress}
            >
              <Ionicons color={colors.ink} name="information-circle-outline" size={24} />
            </Pressable>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons color={colors.slate} name="search-outline" size={20} style={styles.searchIcon} />
              <TextInput
                accessibilityLabel="Tìm thực phẩm hoặc món ăn"
                placeholder="🔍 Tìm thực phẩm hoặc món ăn"
                placeholderTextColor={colors.slate}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Ionicons color={colors.slate} name="close-circle" size={18} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityLabel="Quét mã vạch"
                accessibilityRole="button"
                style={styles.barcodeBtn}
                onPress={handleBarcodePress}
              >
                <Ionicons color={colors.ink} name="barcode-outline" size={22} />
              </Pressable>
            </View>
          </View>

          {/* Quick Action Chips */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal contentContainerStyle={styles.chipsScroll} showsHorizontalScrollIndicator={false}>
              <Pressable
                style={[styles.chip, activeChip === 'CATALOG' && styles.chipActive]}
                onPress={() => setActiveChip('CATALOG')}
              >
                <Text style={[styles.chipText, activeChip === 'CATALOG' && styles.chipTextActive]}>
                  🔍 Catalog
                </Text>
              </Pressable>

              <Pressable
                style={styles.chipAction}
                onPress={() => setCustomSheetVisible(true)}
              >
                <Text style={styles.chipActionText}>
                  ✏️ + Nhập món mới
                </Text>
              </Pressable>

              <Pressable
                style={[styles.chip, activeChip === 'FAVORITES' && styles.chipActive]}
                onPress={() => setActiveChip('FAVORITES')}
              >
                <Text style={[styles.chipText, activeChip === 'FAVORITES' && styles.chipTextActive]}>
                  ⭐ Món tủ của tôi
                </Text>
              </Pressable>

              <Pressable
                style={[styles.chip, activeChip === 'RECENT' && styles.chipActive]}
                onPress={() => setActiveChip('RECENT')}
              >
                <Text style={[styles.chipText, activeChip === 'RECENT' && styles.chipTextActive]}>
                  📋 Bữa ăn gần đây
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Catalog / Custom Food List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeChip === 'CATALOG'
                  ? 'Thực phẩm gợi ý'
                  : activeChip === 'FAVORITES'
                  ? 'Món tủ của tôi'
                  : 'Gần đây'}
              </Text>
              <Text style={styles.sectionCount}>
                {activeChip === 'CATALOG'
                  ? `${filteredCatalogFoods.length} món`
                  : activeChip === 'FAVORITES'
                  ? `${filteredCustomFoods.length} món`
                  : `${recentFoods.length} món`}
              </Text>
            </View>

            {/* List based on activeChip */}
            {activeChip === 'CATALOG' && (
              <View style={styles.foodList}>
                {filteredCatalogFoods.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Không tìm thấy thực phẩm phù hợp</Text>
                  </View>
                ) : (
                  filteredCatalogFoods.map((food) => {
                    const ratio = food.defaultServing.grams / 100;
                    const cals = Math.round(food.nutritionPer100g.caloriesKcal * ratio);
                    const prot = Math.round(food.nutritionPer100g.proteinG * ratio * 10) / 10;
                    const carb = Math.round(food.nutritionPer100g.carbohydrateG * ratio * 10) / 10;
                    const fat = Math.round(food.nutritionPer100g.fatG * ratio * 10) / 10;

                    const inDraft = draftItems.find((di) => di.foodId === food.foodId);

                    return (
                      <View key={food.foodId} style={styles.foodCard}>
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodMeta}>
                            {food.defaultServing.name} • {cals} kcal
                          </Text>
                          <View style={styles.macroBadges}>
                            <Text style={styles.macroTag}>⚡ {prot}g protein</Text>
                            <Text style={styles.macroTag}>🌿 {carb}g carb</Text>
                            <Text style={styles.macroTag}>💧 {fat}g fat</Text>
                          </View>
                        </View>
                        <Pressable
                          accessibilityLabel={`Thêm ${food.name}`}
                          accessibilityRole="button"
                          style={[styles.addBtn, inDraft && styles.addBtnActive]}
                          onPress={() => addCatalogFoodToDraft(food)}
                        >
                          <Ionicons color={inDraft ? colors.surface : colors.ink} name="add" size={20} />
                          {inDraft ? <Text style={styles.addBtnBadge}>{inDraft.quantity}</Text> : null}
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeChip === 'FAVORITES' && (
              <View style={styles.foodList}>
                {filteredCustomFoods.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Chưa có món tủ nào. Nhấn &quot;+ Nhập món mới&quot; để tạo!</Text>
                  </View>
                ) : (
                  filteredCustomFoods.map((customFood) => {
                    const cals = Math.round(customFood.nutritionPerServing.caloriesKcal);
                    const prot = customFood.nutritionPerServing.proteinG;
                    const carb = customFood.nutritionPerServing.carbohydrateG;
                    const fat = customFood.nutritionPerServing.fatG;

                    return (
                      <View key={customFood.customFoodId} style={styles.foodCard}>
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>{customFood.name}</Text>
                          <Text style={styles.foodMeta}>
                            {customFood.servingName} • {cals} kcal
                          </Text>
                          <View style={styles.macroBadges}>
                            <Text style={styles.macroTag}>⚡ {prot}g protein</Text>
                            <Text style={styles.macroTag}>🌿 {carb}g carb</Text>
                            <Text style={styles.macroTag}>💧 {fat}g fat</Text>
                          </View>
                        </View>
                        <Pressable
                          accessibilityLabel={`Thêm ${customFood.name}`}
                          accessibilityRole="button"
                          style={styles.addBtn}
                          onPress={() => addCustomFoodToDraft(customFood)}
                        >
                          <Ionicons color={colors.ink} name="add" size={20} />
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeChip === 'RECENT' && (
              <View style={styles.foodList}>
                {recentFoods.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Chưa có lịch sử bữa ăn gần đây.</Text>
                  </View>
                ) : (
                  recentFoods.map((rf, idx) => (
                    <View key={`recent-${idx}`} style={styles.foodCard}>
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{rf.foodName}</Text>
                        <Text style={styles.foodMeta}>
                          {rf.servingName} • {Math.round(rf.caloriesKcal)} kcal
                        </Text>
                        <View style={styles.macroBadges}>
                          <Text style={styles.macroTag}>⚡ {rf.item.nutrition.proteinG}g protein</Text>
                          <Text style={styles.macroTag}>🌿 {rf.item.nutrition.carbohydrateG}g carb</Text>
                          <Text style={styles.macroTag}>💧 {rf.item.nutrition.fatG}g fat</Text>
                        </View>
                      </View>
                      <Pressable
                        accessibilityLabel={`Thêm ${rf.foodName}`}
                        accessibilityRole="button"
                        style={styles.addBtn}
                        onPress={() => addRecentItemToDraft(rf)}
                      >
                        <Ionicons color={colors.ink} name="add" size={20} />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Meal Draft Section */}
            <View style={styles.draftSectionHeader}>
              <Text style={styles.draftTitle}>Bữa ăn đã chọn ({draftItems.length})</Text>
              {draftItems.length > 0 ? (
                <Pressable onPress={() => setDraftItems([])}>
                  <Text style={styles.clearAllText}>Xóa tất cả</Text>
                </Pressable>
              ) : null}
            </View>

            {draftItems.length === 0 ? (
              <View style={styles.emptyDraftCard}>
                <Ionicons color={colors.slate} name="basket-outline" size={32} />
                <Text style={styles.emptyDraftText}>
                  Chưa có món nào trong bữa ăn này. Hãy bấm dấu [+] ở danh sách trên để thêm.
                </Text>
              </View>
            ) : (
              <View style={styles.draftItemsList}>
                {draftItems.map((item) => (
                  <SwipeableMealItem
                    key={item.draftItemId}
                    caloriesKcal={item.nutrition.caloriesKcal}
                    foodName={item.foodName}
                    id={item.draftItemId}
                    quantity={item.quantity}
                    servingName={item.servingName}
                    onDelete={() => handleDeleteItem(item.draftItemId)}
                    onQuantityChange={(newQty) => handleQuantityChange(item.draftItemId, newQty)}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Docked Bottom Action Bar */}
          <View style={styles.dockedFooter}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Tổng năng lượng</Text>
                <Text style={styles.summaryValue}>{totalNutrition.caloriesKcal} kcal</Text>
              </View>
              <View style={styles.macroSummaryBadges}>
                <View style={styles.macroPill}>
                  <Text style={styles.macroPillLabel}>P:</Text>
                  <Text style={styles.macroPillValue}>{totalNutrition.proteinG}g</Text>
                </View>
                <View style={styles.macroPill}>
                  <Text style={styles.macroPillLabel}>C:</Text>
                  <Text style={styles.macroPillValue}>{totalNutrition.carbohydrateG}g</Text>
                </View>
                <View style={styles.macroPill}>
                  <Text style={styles.macroPillLabel}>F:</Text>
                  <Text style={styles.macroPillValue}>{totalNutrition.fatG}g</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityLabel={`Ghi nhận Bữa ăn (${draftItems.length} món)`}
              accessibilityRole="button"
              disabled={draftItems.length === 0 || isSubmitting}
              style={[
                styles.primarySubmitBtn,
                (draftItems.length === 0 || isSubmitting) && styles.disabledSubmitBtn,
              ]}
              onPress={() => void handleCreateMeal()}
            >
              <Text style={styles.primarySubmitText}>
                {isSubmitting ? 'Đang ghi nhận...' : `Ghi nhận Bữa ăn (${draftItems.length} món)`}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        {/* Custom Food Sheet Modal */}
        <CustomFoodSheet
          initialMealType={mealType}
          visible={customSheetVisible}
          onClose={() => setCustomSheetVisible(false)}
          onSuccess={handleCustomFoodAdded}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownBtn: {
    backgroundColor: colors.peach,
    borderWidth: 1,
    borderColor: colors.apricot,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  barcodeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  chipsContainer: {
    marginBottom: 12,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.peach,
    borderColor: colors.apricot,
  },
  chipText: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.ink,
    fontWeight: '800',
  },
  chipAction: {
    backgroundColor: colors.peach,
    borderWidth: 1,
    borderColor: colors.apricot,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActionText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    color: colors.slate,
    fontSize: 13,
  },
  foodList: {
    gap: 10,
    marginBottom: 20,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  foodInfo: {
    flex: 1,
    paddingRight: 10,
  },
  foodName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  foodMeta: {
    color: colors.slate,
    fontSize: 13,
    marginTop: 2,
  },
  macroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  macroTag: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: colors.canvas,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.peach,
    borderWidth: 1,
    borderColor: colors.apricot,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addBtnActive: {
    backgroundColor: colors.apricot,
  },
  addBtnBadge: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.slate,
    fontSize: 14,
    textAlign: 'center',
  },
  draftSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  draftTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  clearAllText: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyDraftCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyDraftText: {
    color: colors.slate,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  draftItemsList: {
    gap: 2,
  },
  dockedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  macroSummaryBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.peach,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  macroPillLabel: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: '700',
  },
  macroPillValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  primarySubmitBtn: {
    backgroundColor: colors.apricot,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSubmitBtn: {
    opacity: 0.5,
  },
  primarySubmitText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
});
