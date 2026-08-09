import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

export interface SwipeableMealItemProps {
  id: string;
  foodName: string;
  servingName: string;
  caloriesKcal: number;
  quantity?: number; // default 1
  onQuantityChange: (newQuantity: number) => void;
  onDelete: () => void;
}

export function SwipeableMealItem({
  id: _id,
  foodName,
  servingName,
  caloriesKcal,
  quantity = 1,
  onQuantityChange,
  onDelete,
}: SwipeableMealItemProps) {
  const totalCalories = Math.round(caloriesKcal * quantity);

  const handleDeletePress = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa món "${foodName}" khỏi bữa ăn không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const renderRightActions = () => {
    return (
      <Pressable
        accessibilityLabel={`Xóa món ${foodName}`}
        accessibilityRole="button"
        className="mb-3 ml-2.5 flex-1 max-w-[80px] flex-row items-center justify-center rounded-2xl bg-[#FF4757]"
        onPress={handleDeletePress}
      >
        <Ionicons color="#FFFFFF" name="trash-outline" size={24} />
      </Pressable>
    );
  };

  const handleDecrease = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <ReanimatedSwipeable
      friction={2}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-[#E9E1D8] bg-white p-4 shadow-sm">
        {/* Food details */}
        <View className="flex-1 pr-3">
          <Text
            className="text-[16px] font-bold text-[#2F3542]"
            numberOfLines={1}
          >
            {foodName}
          </Text>
          <Text className="mt-1 text-[13px] font-medium text-[#697386]">
            {servingName} • {totalCalories} kcal
          </Text>
        </View>

        {/* Stepper control [ - qty + ] */}
        <View className="flex-row items-center rounded-xl border border-[#E9E1D8] bg-[#FFF9F0] p-1">
          <Pressable
            accessibilityLabel="Giảm số lượng"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-[#FFF0E7]"
            onPress={handleDecrease}
          >
            <Ionicons color="#2F3542" name="remove" size={18} />
          </Pressable>

          <Text className="min-w-[28px] text-center text-[14px] font-bold text-[#2F3542]">
            {quantity}
          </Text>

          <Pressable
            accessibilityLabel="Tăng số lượng"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-[#FFF0E7]"
            onPress={handleIncrease}
          >
            <Ionicons color="#2F3542" name="add" size={18} />
          </Pressable>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}
