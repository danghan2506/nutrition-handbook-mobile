import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mealApi } from '@/lib/meal-api';
import type { CustomFood, MealType, Nutrients } from '@/types/meals';

export interface CustomFoodSheetProps {
  visible: boolean;
  initialMealType: MealType;
  onClose: () => void;
  onSuccess: (customFood: CustomFood, selectedMealType: MealType) => void;
}

const MEAL_TYPE_OPTIONS: { type: MealType; label: string }[] = [
  { type: 'BREAKFAST', label: 'Bữa Sáng' },
  { type: 'LUNCH', label: 'Bữa Trưa' },
  { type: 'DINNER', label: 'Bữa Tối' },
  { type: 'SNACK', label: 'Bữa Phụ' },
];

interface NutrientFieldConfig {
  key: keyof Nutrients;
  label: string;
  unit: string;
}

const NUTRIENT_FIELDS: NutrientFieldConfig[] = [
  { key: 'caloriesKcal', label: 'Năng lượng', unit: 'kcal' },
  { key: 'proteinG', label: 'Đạm', unit: 'g' },
  { key: 'carbohydrateG', label: 'Tinh bột', unit: 'g' },
  { key: 'fatG', label: 'Chất béo', unit: 'g' },
  { key: 'fiberG', label: 'Chất xơ', unit: 'g' },
  { key: 'sugarG', label: 'Đường', unit: 'g' },
  { key: 'sodiumMg', label: 'Natri', unit: 'mg' },
];

type NutrientFormState = Record<keyof Nutrients, string>;

const INITIAL_NUTRIENTS: NutrientFormState = {
  caloriesKcal: '',
  proteinG: '',
  carbohydrateG: '',
  fatG: '',
  fiberG: '',
  sugarG: '',
  sodiumMg: '',
};

export function CustomFoodSheet({
  visible,
  initialMealType,
  onClose,
  onSuccess,
}: CustomFoodSheetProps) {
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [name, setName] = useState('');
  const [servingName, setServingName] = useState('1 khẩu phần');
  const [servingGrams, setServingGrams] = useState('100');
  const [nutrients, setNutrients] = useState<NutrientFormState>(INITIAL_NUTRIENTS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMealType(initialMealType);
      setName('');
      setServingName('1 khẩu phần');
      setServingGrams('100');
      setNutrients(INITIAL_NUTRIENTS);
      setError(null);
      setIsSubmitting(false);
    }
  }, [visible, initialMealType]);

  const updateNutrient = (key: keyof Nutrients, value: string) => {
    setNutrients((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên món ăn');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const parsedGrams = Number(servingGrams.replace(',', '.')) || 100;
      const nutritionPerServing: Nutrients = {
        caloriesKcal: Number(nutrients.caloriesKcal.replace(',', '.')) || 0,
        proteinG: Number(nutrients.proteinG.replace(',', '.')) || 0,
        carbohydrateG: Number(nutrients.carbohydrateG.replace(',', '.')) || 0,
        fatG: Number(nutrients.fatG.replace(',', '.')) || 0,
        fiberG: Number(nutrients.fiberG.replace(',', '.')) || 0,
        sugarG: Number(nutrients.sugarG.replace(',', '.')) || 0,
        sodiumMg: Number(nutrients.sodiumMg.replace(',', '.')) || 0,
      };

      const response = await mealApi.createCustomFood({
        name: trimmedName,
        servingName: servingName.trim() || '1 khẩu phần',
        servingGrams: parsedGrams,
        nutritionPerServing,
      });

      if (response.data) {
        onSuccess(response.data, mealType);
        onClose();
      } else {
        setError(response.error?.message ?? 'Tạo món thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Đã xảy ra lỗi khi lưu món ăn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <SafeAreaView edges={['bottom']} style={styles.overlay}>
          <Pressable
            accessibilityLabel="Đóng sheet"
            style={styles.backdrop}
            onPress={onClose}
          />
          <View className="max-h-[85%] rounded-t-[28px] border-t border-[#E9E1D8] bg-[#FFF9F0] px-5 pb-6 pt-4">
            {/* Grabber handle */}
            <View className="mb-3 items-center">
              <View className="h-1.5 w-10 rounded-full bg-[#E9E1D8]" />
            </View>

            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[20px] font-extrabold text-[#2F3542]">
                Tạo món tùy chỉnh
              </Text>
              <Pressable
                accessibilityLabel="Đóng"
                accessibilityRole="button"
                className="h-9 w-9 items-center justify-center rounded-full border border-[#E9E1D8] bg-surface active:bg-[#FFF0E7]"
                onPress={onClose}
              >
                <Ionicons color="#2F3542" name="close" size={20} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Meal Type Segmented Control */}
              <View className="mb-4">
                <Text className="mb-2 text-[14px] font-bold text-[#2F3542]">
                  Bữa ăn
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {MEAL_TYPE_OPTIONS.map((option) => {
                    const isSelected = mealType === option.type;
                    return (
                      <Pressable
                        key={option.type}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        className={`flex-1 min-w-[75px] items-center justify-center rounded-2xl border px-3 py-2.5 ${
                          isSelected
                            ? 'border-[#FF9E7A] bg-[#FFF0E7]'
                            : 'border-[#E9E1D8] bg-surface'
                        }`}
                        onPress={() => setMealType(option.type)}
                      >
                        <Text
                          className={`text-[13px] ${
                            isSelected
                              ? 'font-extrabold text-[#2F3542]'
                              : 'font-medium text-[#697386]'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Food Name */}
              <View className="mb-4">
                <Text className="mb-1.5 text-[14px] font-bold text-[#2F3542]">
                  Tên món ăn <Text className="text-[#9B4135]">*</Text>
                </Text>
                <TextInput
                  className={`min-h-[50px] rounded-xl border bg-surface px-3.5 text-[15px] text-[#2F3542] ${
                    error ? 'border-[#9B4135]' : 'border-[#E9E1D8]'
                  }`}
                  placeholder="Ví dụ: Bánh mì chả lụa..."
                  placeholderTextColor="#697386"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (error) setError(null);
                  }}
                />
                {error ? (
                  <Text className="mt-1.5 text-[13px] font-medium text-[#9B4135]">
                    {error}
                  </Text>
                ) : null}
              </View>

              {/* Serving Name & Grams */}
              <View className="mb-4 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1.5 text-[14px] font-bold text-[#2F3542]">
                    Khẩu phần
                  </Text>
                  <TextInput
                    className="min-h-[50px] rounded-xl border border-[#E9E1D8] bg-surface px-3.5 text-[15px] text-[#2F3542]"
                    placeholder="1 khẩu phần"
                    placeholderTextColor="#697386"
                    value={servingName}
                    onChangeText={setServingName}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1.5 text-[14px] font-bold text-[#2F3542]">
                    Trọng lượng (g)
                  </Text>
                  <TextInput
                    className="min-h-[50px] rounded-xl border border-[#E9E1D8] bg-surface px-3.5 text-[15px] text-[#2F3542]"
                    keyboardType="decimal-pad"
                    placeholder="100"
                    placeholderTextColor="#697386"
                    value={servingGrams}
                    onChangeText={setServingGrams}
                  />
                </View>
              </View>

              {/* Nutrient Inputs Section Header */}
              <View className="mb-2.5 flex-row items-baseline justify-between">
                <Text className="text-[14px] font-bold text-[#2F3542]">
                  Chỉ số dinh dưỡng
                </Text>
                <Text className="text-[12px] font-medium text-[#697386]">
                  trên mỗi khẩu phần
                </Text>
              </View>

              {/* 2-Column Grid for Nutrients */}
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {NUTRIENT_FIELDS.map((field) => (
                  <View key={field.key} className="w-[48%]">
                    <Text className="mb-1 text-[13px] font-semibold text-[#697386]">
                      {field.label}
                    </Text>
                    <View className="h-[46px] flex-row items-center rounded-xl border border-[#E9E1D8] bg-surface px-3">
                      <TextInput
                        className="flex-1 text-[15px] font-bold text-[#2F3542]"
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#697386"
                        value={nutrients[field.key]}
                        onChangeText={(val) => updateNutrient(field.key, val)}
                      />
                      <Text className="ml-1 text-[12px] font-medium text-[#697386]">
                        {field.unit}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Submit CTA */}
              <Pressable
                accessibilityLabel="Lưu món & Thêm vào bữa ăn"
                accessibilityRole="button"
                className={`mt-6 h-[54px] items-center justify-center rounded-2xl bg-[#FF9E7A] active:opacity-90 ${
                  isSubmitting || !name.trim() ? 'opacity-50' : ''
                }`}
                disabled={isSubmitting || !name.trim()}
                onPress={() => void handleSave()}
              >
                <Text className="text-[16px] font-extrabold text-white">
                  {isSubmitting ? 'Đang lưu món...' : 'Lưu món & Thêm vào bữa ăn'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(47, 53, 66, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
