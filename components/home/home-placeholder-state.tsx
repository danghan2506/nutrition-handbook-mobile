import { Pressable, Text, View } from 'react-native';

export function HomeLoadingState() {
  return (
    <View accessibilityLabel="Đang tải dữ liệu ngày" className="gap-4">
      <View className="h-24 rounded-[20px] bg-quiet-dot" />
      <View className="h-32 rounded-[20px] bg-quiet-dot" />
      <View className="h-24 rounded-[18px] bg-quiet-dot" />
      <View className="h-24 rounded-[18px] bg-quiet-dot" />
    </View>
  );
}

export function HomeEmptyState() {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="items-center rounded-[20px] bg-peach px-6 py-8">
      <Text className="text-center text-[17px] font-bold text-ink-navy">
        Chưa có bữa ăn nào trong ngày này
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-5 text-soft-slate">
        Khi bạn ghi lại bữa ăn, thông tin sẽ xuất hiện ở đây.
      </Text>
    </View>
  );
}

export function HomeErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="items-center rounded-[20px] bg-peach px-6 py-8">
      <Text className="text-center text-[17px] font-bold text-ink-navy">
        Chưa tải được dữ liệu của ngày này.
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-5 text-soft-slate">
        Hãy thử lại khi bạn sẵn sàng.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Thử lại"
        className="mt-5 h-11 items-center justify-center rounded-xl bg-apricot px-5 active:opacity-80"
        onPress={onRetry}>
        <Text className="text-[14px] font-bold text-ink-navy">Thử lại</Text>
      </Pressable>
    </View>
  );
}