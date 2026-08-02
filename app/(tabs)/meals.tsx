import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mealApi } from '@/lib/meal-api';
import { useMealsStore } from '@/store/use-meals-store';
import { mealTypeLabels } from '@/constants/meals';
import type { CatalogFood } from '@/types/meals';

const colors = { canvas: '#FFF9F0', surface: '#FFFFFF', ink: '#2F3542', slate: '#697386', apricot: '#FF9E7A', peach: '#FFF0E7', butter: '#FDE7A9', leaf: '#EAF0ED' };

export default function MealsScreen() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogFood[]>([]);
  const { meals, isLoading, error, loadMeals } = useMealsStore();

  useEffect(() => { void loadMeals(date); }, [date, loadMeals]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { void mealApi.searchFoods(query).then((response) => { if (active) setResults(response.data ?? []); }); }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const dateLabel = useMemo(() => date === new Date().toISOString().slice(0, 10) ? 'Hôm nay' : new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' }), [date]);
  const moveDate = (delta: number) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + delta); setDate(next.toISOString().slice(0, 10)); };

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}><View><Text style={styles.eyebrow}>NHẬT KÝ DINH DƯỠNG</Text><Text style={styles.title}>Bữa ăn</Text></View><Pressable accessibilityLabel="Thông tin về bữa ăn" style={styles.iconButton}><IconSymbol name="info.circle" size={22} color={colors.ink} /></Pressable></View>
      <View style={styles.dateRow}><Pressable onPress={() => moveDate(-1)} style={styles.dateArrow}><IconSymbol name="chevron.left" size={18} color={colors.ink} /></Pressable><Text style={styles.dateText}>{dateLabel}</Text><Pressable onPress={() => moveDate(1)} style={styles.dateArrow}><IconSymbol name="chevron.right" size={18} color={colors.ink} /></Pressable></View>

      <View style={styles.searchWrap}><IconSymbol name="magnifyingglass" size={21} color={colors.slate} /><TextInput value={query} onChangeText={setQuery} placeholder="Tìm thực phẩm hoặc món ăn" placeholderTextColor={colors.slate} style={styles.searchInput} returnKeyType="search" /></View>
      {query.length > 0 && <View style={styles.searchResults}>{results.length === 0 ? <Text style={styles.muted}>Chưa tìm thấy món phù hợp.</Text> : results.slice(0, 4).map((food) => <Pressable key={food.foodId} onPress={() => router.push({ pathname: '/meal/create' as never, params: { foodId: food.foodId, date } })} style={styles.resultRow}><View><Text style={styles.resultName}>{food.name}</Text><Text style={styles.resultMeta}>{food.category} · {food.defaultServing.name}</Text></View><IconSymbol name="plus.circle" size={22} color={colors.apricot} /></Pressable>)}</View>}

      <View style={styles.tileRow}><Pressable onPress={() => router.push({ pathname: '/meal/create' as never, params: { date } })} style={[styles.actionTile, { backgroundColor: colors.peach }]}><View style={[styles.tileIcon, { backgroundColor: colors.apricot }]}><IconSymbol name="square.and.pencil" size={22} color={colors.ink} /></View><Text style={styles.tileTitle}>Tạo món của tôi</Text><Text style={styles.tileCaption}>Nhập thành phần thủ công</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/meal/ai' as never, params: { date } })} style={[styles.actionTile, { backgroundColor: colors.leaf }]}><View style={[styles.tileIcon, { backgroundColor: '#9BCB8D' }]}><IconSymbol name="camera.viewfinder" size={22} color={colors.ink} /></View><Text style={styles.tileTitle}>Nhận diện món ăn</Text><Text style={styles.tileCaption}>Chụp hoặc chọn ảnh</Text></Pressable></View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Lịch sử trong ngày</Text><Text style={styles.count}>{meals.length} bữa</Text></View>
      {isLoading ? <View style={styles.emptyCard}><Text style={styles.muted}>Đang tải nhật ký…</Text></View> : error ? <View style={styles.emptyCard}><Text style={styles.muted}>{error}</Text><Pressable onPress={() => void loadMeals(date)}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : meals.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Chưa có bữa ăn nào</Text><Text style={styles.muted}>Ghi lại một bữa để theo dõi ngày hôm nay nhẹ nhàng hơn.</Text></View> : meals.map((meal) => <View key={meal.mealId} style={styles.mealRow}><View style={styles.mealDot}><IconSymbol name="fork.knife" size={18} color={colors.ink} /></View><View style={styles.mealInfo}><Text style={styles.mealName}>{mealTypeLabels[meal.mealType]}</Text><Text style={styles.mealMeta}>{new Date(meal.eatenAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {meal.items.map((item) => item.foodName).join(', ')}</Text></View><Text style={styles.mealCalories}>{Math.round(meal.nutritionSummary.caloriesKcal)} kcal</Text></View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { padding: 22, paddingBottom: 40 }, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: colors.slate, fontSize: 11, letterSpacing: 1.1, fontWeight: '700' }, title: { color: colors.ink, fontSize: 32, fontWeight: '700', marginTop: 4 }, iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 18, gap: 18 }, dateArrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, dateText: { color: colors.ink, fontSize: 16, fontWeight: '600', minWidth: 110, textAlign: 'center' }, searchWrap: { height: 54, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#E9E1D8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, searchInput: { flex: 1, color: colors.ink, fontSize: 16, marginLeft: 10 }, searchResults: { backgroundColor: colors.surface, borderRadius: 16, marginTop: 8, paddingHorizontal: 16 }, resultRow: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: '#F0EAE3', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, resultName: { color: colors.ink, fontSize: 15, fontWeight: '600' }, resultMeta: { color: colors.slate, fontSize: 13, marginTop: 3 }, tileRow: { flexDirection: 'row', gap: 12, marginTop: 18 }, actionTile: { flex: 1, borderRadius: 20, padding: 16, minHeight: 162 }, tileIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, tileTitle: { color: colors.ink, fontWeight: '700', fontSize: 17 }, tileCaption: { color: colors.slate, fontSize: 13, lineHeight: 18, marginTop: 6 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 12 }, sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '700' }, count: { color: colors.slate, fontSize: 14 }, emptyCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: 'center', minHeight: 130, justifyContent: 'center' }, emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', marginBottom: 6 }, muted: { color: colors.slate, fontSize: 14, textAlign: 'center', lineHeight: 21 }, retry: { color: colors.ink, fontWeight: '700', marginTop: 10 }, mealRow: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, mealDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, mealInfo: { flex: 1 }, mealName: { color: colors.ink, fontSize: 16, fontWeight: '700' }, mealMeta: { color: colors.slate, fontSize: 13, marginTop: 4 }, mealCalories: { color: colors.ink, fontSize: 14, fontWeight: '700' }, });
