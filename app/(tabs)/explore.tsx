import { ScrollView, Text, View } from '@/components/ui/tw';

export default function AnalysisScreen() {
  return (
    <ScrollView
      className="flex-1 bg-cloud"
      contentContainerClassName="px-5 pb-28 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-[440px]">
        <Text
          accessibilityRole="header"
          className="font-rounded text-[30px] font-extrabold text-ink-navy">
          Phân tích
        </Text>
        <Text className="mt-3 text-[16px] leading-6 text-soft-slate">
          Xu hướng dinh dưỡng của bạn sẽ xuất hiện tại đây.
        </Text>
      </View>
    </ScrollView>
  );
}
