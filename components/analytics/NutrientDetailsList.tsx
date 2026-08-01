import React from 'react';
import { View, Text } from 'react-native';
import { DailyAssessmentData } from '../../types/analytics';

interface NutrientDetailsListProps {
  nutritionSummary: DailyAssessmentData['nutritionSummary'];
  targets: DailyAssessmentData['targets'];
}

export const NutrientDetailsList: React.FC<NutrientDetailsListProps> = ({
  nutritionSummary,
  targets,
}) => {
  const { caloriesKcal, proteinG, carbohydrateG, fatG, fiberG, sodiumMg } = nutritionSummary;
  const { caloriesKcal: targetCal, proteinG: targetProt, fiberG: targetFib, sodiumMg: targetSod } = targets;

  // Sodium status check
  const isSodiumExceeded = targetSod.max ? sodiumMg > targetSod.max : false;

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4 shadow-sm border border-[#F0EAE1]">
      <Text className="text-[#2F3542] font-bold text-base mb-4">Chi Tiết Tiến Độ Dinh Dưỡng</Text>

      {/* Calories */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-sm font-semibold text-[#2F3542]">Năng Lượng (Calories)</Text>
          <Text className="text-sm font-bold text-[#2F3542]">
            {caloriesKcal} <Text className="text-xs font-normal text-[#697386]">/ {targetCal.max || 2000} kcal</Text>
          </Text>
        </View>
        <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min((caloriesKcal / (targetCal.max || 2000)) * 100, 100)}%` }}
            className="h-full bg-[#FF9E7A] rounded-full"
          />
        </View>
        {targetCal.min && targetCal.max && (
          <Text className="text-[11px] text-[#697386] mt-1">
            Khoảng mục tiêu: {targetCal.min} - {targetCal.max} kcal
          </Text>
        )}
      </View>

      {/* Protein */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-sm font-semibold text-[#2F3542]">Đạm (Protein)</Text>
          <Text className="text-sm font-bold text-[#2F3542]">
            {proteinG}g <Text className="text-xs font-normal text-[#697386]">/ {targetProt.max || 100}g</Text>
          </Text>
        </View>
        <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min((proteinG / (targetProt.max || 100)) * 100, 100)}%` }}
            className="h-full bg-[#9BCB8D] rounded-full"
          />
        </View>
        {targetProt.min && targetProt.max && (
          <Text className="text-[11px] text-[#697386] mt-1">
            Khoảng mục tiêu: {targetProt.min} - {targetProt.max} g
          </Text>
        )}
      </View>

      {/* Fiber */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-sm font-semibold text-[#2F3542]">Chất Xơ (Fiber)</Text>
          <Text className="text-sm font-bold text-[#2F3542]">
            {fiberG}g <Text className="text-xs font-normal text-[#697386]">/ {targetFib.min || 25}g min</Text>
          </Text>
        </View>
        <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min((fiberG / (targetFib.min || 25)) * 100, 100)}%` }}
            className="h-full bg-[#FFD66B] rounded-full"
          />
        </View>
        <Text className="text-[11px] text-[#697386] mt-1">
          Mục tiêu tối thiểu: {targetFib.min || 25} g
        </Text>
      </View>

      {/* Sodium */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1.5">
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-[#2F3542]">Natri (Sodium)</Text>
            {isSodiumExceeded && (
              <View className="ml-2 bg-[#FF8B78]/20 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-[#FF8B78]">Vượt giới hạn</Text>
              </View>
            )}
          </View>
          <Text className="text-sm font-bold text-[#2F3542]">
            {sodiumMg} <Text className="text-xs font-normal text-[#697386]">/ {targetSod.max || 2000} mg</Text>
          </Text>
        </View>
        <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min((sodiumMg / (targetSod.max || 2000)) * 100, 100)}%` }}
            className={`h-full rounded-full ${isSodiumExceeded ? 'bg-[#FF8B78]' : 'bg-[#A9D7F5]'}`}
          />
        </View>
        <Text className="text-[11px] text-[#697386] mt-1">
          Giới hạn tối đa: {targetSod.max || 2000} mg
        </Text>
      </View>

      {/* Carbs & Fat Summary Row */}
      <View className="flex-row justify-between pt-3 border-t border-[#F0EAE1]">
        <View>
          <Text className="text-xs text-[#697386]">Tinh Bột (Carbs)</Text>
          <Text className="text-base font-semibold text-[#2F3542] mt-0.5">{carbohydrateG} g</Text>
        </View>
        <View>
          <Text className="text-xs text-[#697386]">Chất Béo (Fat)</Text>
          <Text className="text-base font-semibold text-[#2F3542] mt-0.5">{fatG} g</Text>
        </View>
      </View>
    </View>
  );
};
