import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mealApi, createIdempotencyKey } from '@/lib/meal-api';
import { useMealsStore } from '@/store/use-meals-store';
import { mockCatalogFoods } from '@/data/mock-meals';
import { mealTypeLabels } from '@/constants/meals';
import type { MealType, Nutrients } from '@/types/meals';

const colors = { canvas: '#FFF9F0', surface: '#FFFFFF', ink: '#2F3542', slate: '#697386', apricot: '#FF9E7A', peach: '#FFF0E7', border: '#E9E1D8' };
const nutrientFields: { key: keyof Nutrients; label: string; unit: string }[] = [
  { key: 'caloriesKcal', label: 'Năng lượng', unit: 'kcal' }, { key: 'proteinG', label: 'Đạm', unit: 'g' }, { key: 'carbohydrateG', label: 'Tinh bột', unit: 'g' }, { key: 'fatG', label: 'Chất béo', unit: 'g' }, { key: 'fiberG', label: 'Chất xơ', unit: 'g' }, { key: 'sugarG', label: 'Đường', unit: 'g' }, { key: 'sodiumMg', label: 'Natri', unit: 'mg' },
];
const blankNutrients: Nutrients = { caloriesKcal: 0, proteinG: 0, carbohydrateG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 };

export default function CreateMealScreen() {
  const params = useLocalSearchParams<{ foodId?: string; date?: string }>();
  const food = useMemo(() => mockCatalogFoods.find((item) => item.foodId === params.foodId), [params.foodId]);
  const [mealType, setMealType] = useState<MealType>('LUNCH');
  const [name, setName] = useState(food?.name ?? '');
  const [serving, setServing] = useState(food?.defaultServing.name ?? '1 khẩu phần');
  const [grams, setGrams] = useState(String(food?.defaultServing.grams ?? 100));
  const [nutrients, setNutrients] = useState<Nutrients>(food?.nutritionPer100g ?? blankNutrients);
  const [saving, setSaving] = useState(false);
  const appendMeal = useMealsStore((state) => state.appendMeal);

  const updateNutrient = (key: keyof Nutrients, value: string) => setNutrients((current) => ({ ...current, [key]: Number(value.replace(',', '.')) || 0 }));
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const eatenAt = new Date(`${params.date ?? new Date().toISOString().slice(0, 10)}T12:00:00`).toISOString(); const custom = food ? null : await mealApi.createCustomFood({ name, servingName: serving, servingGrams: Number(grams) || 100, nutritionPerServing: nutrients }); const response = await mealApi.createMeal({ mealType, eatenAt, items: food ? [{ referenceType: 'CATALOG', foodId: food.foodId, servingId: food.defaultServing.servingId, quantity: 1 }] : [{ referenceType: 'CUSTOM', customFoodId: custom?.data?.customFoodId, quantity: 1 }] }, createIdempotencyKey());
    if (response.data) appendMeal(response.data);
    setSaving(false);
    if (response.data) router.back();
  };

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.title}>Tạo món của tôi</Text><View style={styles.spacer} /></View><Text style={styles.subtitle}>Nhập thông tin để AURALE ghi lại đúng khẩu phần của bạn.</Text>
    <Text style={styles.label}>Bữa nào?</Text><View style={styles.segment}>{(Object.keys(mealTypeLabels) as MealType[]).map((type) => <Pressable key={type} onPress={() => setMealType(type)} style={[styles.segmentItem, mealType === type && styles.segmentActive]}><Text style={[styles.segmentText, mealType === type && styles.segmentTextActive]}>{mealTypeLabels[type]}</Text></Pressable>)}</View>
    <Text style={styles.label}>Tên món ăn</Text><TextInput value={name} onChangeText={setName} placeholder="Ví dụ: Bánh mì trứng" placeholderTextColor={colors.slate} style={styles.input} />
    <View style={styles.twoCol}><View style={styles.col}><Text style={styles.label}>Khẩu phần</Text><TextInput value={serving} onChangeText={setServing} style={styles.input} /></View><View style={styles.col}><Text style={styles.label}>Khối lượng (g)</Text><TextInput value={grams} onChangeText={setGrams} keyboardType="decimal-pad" style={styles.input} /></View></View>
    <View style={styles.nutritionHeader}><Text style={styles.label}>Chỉ số dinh dưỡng</Text><Text style={styles.helper}>trên khẩu phần</Text></View><View style={styles.nutrientGrid}>{nutrientFields.map((field) => <View key={field.key} style={styles.nutrientCell}><Text style={styles.nutrientLabel}>{field.label}</Text><View style={styles.nutrientInputWrap}><TextInput value={String(nutrients[field.key])} onChangeText={(value) => updateNutrient(field.key, value)} keyboardType="decimal-pad" style={styles.nutrientInput} /><Text style={styles.unit}>{field.unit}</Text></View></View>)}</View>
    <View style={styles.review}><Text style={styles.reviewTitle}>Bạn sẽ ghi lại</Text><Text style={styles.reviewText}>{mealTypeLabels[mealType]} · {name || 'Chưa đặt tên'} · {Math.round(nutrients.caloriesKcal)} kcal</Text></View><Pressable onPress={() => void save()} style={[styles.primary, (!name.trim() || saving) && styles.disabled]} disabled={!name.trim() || saving}><Text style={styles.primaryText}>{saving ? 'Đang ghi lại…' : 'Ghi lại bữa ăn'}</Text></Pressable>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, flex: { flex: 1 }, content: { padding: 22, paddingBottom: 40 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, backText: { color: colors.ink, fontSize: 34, lineHeight: 36, marginTop: -4 }, title: { color: colors.ink, fontSize: 23, fontWeight: '700' }, spacer: { width: 44 }, subtitle: { color: colors.slate, fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 18 }, label: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 14 }, segment: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, segmentItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.surface }, segmentActive: { backgroundColor: colors.peach, borderColor: colors.apricot }, segmentText: { color: colors.slate, fontSize: 14 }, segmentTextActive: { color: colors.ink, fontWeight: '700' }, input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 52, borderRadius: 15, paddingHorizontal: 14, color: colors.ink, fontSize: 16 }, twoCol: { flexDirection: 'row', gap: 10 }, col: { flex: 1 }, nutritionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, helper: { color: colors.slate, fontSize: 13 }, nutrientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, nutrientCell: { width: '48%' }, nutrientLabel: { color: colors.slate, fontSize: 13, marginBottom: 5 }, nutrientInputWrap: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }, nutrientInput: { flex: 1, color: colors.ink, fontSize: 15 }, unit: { color: colors.slate, fontSize: 12 }, review: { backgroundColor: colors.peach, borderRadius: 18, padding: 16, marginTop: 22 }, reviewTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' }, reviewText: { color: colors.slate, fontSize: 14, marginTop: 5 }, primary: { backgroundColor: colors.apricot, minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, primaryText: { color: colors.ink, fontSize: 16, fontWeight: '700' }, disabled: { opacity: 0.5 } });
