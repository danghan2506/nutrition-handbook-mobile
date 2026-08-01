import React from 'react';
import { View, Text } from 'react-native';
import { DailyAssessmentData, TargetItem } from '../../types/analytics';

interface NutrientDetailsListProps {
  nutritionSummary: DailyAssessmentData['nutritionSummary'];
  targets: DailyAssessmentData['targets'];
}

interface MetricRowProps {
  label: string;
  unit: string;
  actual: number | null;
  target: TargetItem | null | undefined;
  fillClassName: string;
  limit?: 'max' | 'min';
}

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const targetLabel = (target: TargetItem | null | undefined, unit: string): string => {
  if (!target) return 'Chưa có mục tiêu';
  if (finite(target.min) && finite(target.max)) {
    return 'Khoảng mục tiêu: ' + target.min + ' - ' + target.max + ' ' + unit;
  }
  if (finite(target.max)) return 'Mục tiêu tối đa: ' + target.max + ' ' + unit;
  if (finite(target.min)) return 'Mục tiêu tối thiểu: ' + target.min + ' ' + unit;
  return 'Chưa có mục tiêu';
};

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  unit,
  actual,
  target,
  fillClassName,
  limit = 'max',
}) => {
  const targetValue = target && finite(target[limit]) ? target[limit] : null;
  const hasActual = finite(actual);
  const denominator = targetValue !== null && targetValue > 0 ? targetValue : null;
  const progress = hasActual && denominator !== null
    ? Math.min(Math.max((actual / denominator) * 100, 0), 100)
    : 0;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-sm font-semibold text-[#2F3542]">{label}</Text>
        <Text className="text-sm font-bold text-[#2F3542]">
          {hasActual ? actual + unit : 'Chưa có dữ liệu'}
          {targetValue !== null && (
            <Text className="text-xs font-normal text-[#697386]"> / {targetValue}{unit}</Text>
          )}
        </Text>
      </View>
      <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
        {hasActual && denominator !== null && (
          <View
            style={{ width: progress + '%' }}
            className={'h-full rounded-full ' + fillClassName}
          />
        )}
      </View>
      <Text className="text-[11px] text-[#697386] mt-1">{targetLabel(target, unit)}</Text>
    </View>
  );
};

export const NutrientDetailsList: React.FC<NutrientDetailsListProps> = ({
  nutritionSummary,
  targets,
}) => {
  const isSodiumExceeded =
    finite(nutritionSummary.sodiumMg) &&
    finite(targets.sodiumMg?.max) &&
    nutritionSummary.sodiumMg > targets.sodiumMg.max;

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4 shadow-sm border border-[#F0EAE1]">
      <Text className="text-[#2F3542] font-bold text-base mb-4">Chi Tiết Tiến Độ Dinh Dưỡng</Text>

      <MetricRow
        label="Năng Lượng (Calories)"
        unit=" kcal"
        actual={nutritionSummary.caloriesKcal}
        target={targets.caloriesKcal}
        fillClassName="bg-[#FF9E7A]"
      />

      <MetricRow
        label="Đạm (Protein)"
        unit="g"
        actual={nutritionSummary.proteinG}
        target={targets.proteinG}
        fillClassName="bg-[#9BCB8D]"
      />

      <MetricRow
        label="Chất Xơ (Fiber)"
        unit="g"
        actual={nutritionSummary.fiberG}
        target={targets.fiberG}
        fillClassName="bg-[#FFD66B]"
        limit="min"
      />

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
            {finite(nutritionSummary.sodiumMg) ? nutritionSummary.sodiumMg + ' mg' : 'Chưa có dữ liệu'}
            {finite(targets.sodiumMg?.max) && (
              <Text className="text-xs font-normal text-[#697386]"> / {targets.sodiumMg.max} mg</Text>
            )}
          </Text>
        </View>
        <View className="h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
          {finite(nutritionSummary.sodiumMg) && finite(targets.sodiumMg?.max) && targets.sodiumMg.max > 0 && (
            <View
              style={{
                width:
                  Math.min(Math.max((nutritionSummary.sodiumMg / targets.sodiumMg.max) * 100, 0), 100) + '%',
              }}
              className={'h-full rounded-full ' + (isSodiumExceeded ? 'bg-[#FF8B78]' : 'bg-[#A9D7F5]')}
            />
          )}
        </View>
        <Text className="text-[11px] text-[#697386] mt-1">{targetLabel(targets.sodiumMg, 'mg')}</Text>
      </View>

      <View className="flex-row justify-between pt-3 border-t border-[#F0EAE1]">
        <View>
          <Text className="text-xs text-[#697386]">Tinh Bột (Carbs)</Text>
          <Text className="text-base font-semibold text-[#2F3542] mt-0.5">
            {finite(nutritionSummary.carbohydrateG) ? nutritionSummary.carbohydrateG + ' g' : 'Chưa có dữ liệu'}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-[#697386]">Chất Béo (Fat)</Text>
          <Text className="text-base font-semibold text-[#2F3542] mt-0.5">
            {finite(nutritionSummary.fatG) ? nutritionSummary.fatG + ' g' : 'Chưa có dữ liệu'}
          </Text>
        </View>
      </View>
    </View>
  );
};