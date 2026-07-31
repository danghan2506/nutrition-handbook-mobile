import { ScrollView, Text, View } from '@/components/ui/tw';

export default function MealsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-cloud"
      contentContainerClassName="px-5 pb-28 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-[440px]">
        <Text className="font-rounded text-[30px] font-extrabold text-ink-navy">
          Bữa ăn
        </Text>
        <Text className="mt-3 text-[16px] leading-6 text-soft-slate">
          Các bữa đã ghi sẽ được tập hợp tại đây.
        </Text>
      </View>
    </ScrollView>
  );
}
