import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

import { images } from '@/constants/images';

type VietnameseFoodAiIllustrationProps = {
  lookupLabel: string;
  metrics: readonly [string, string, string];
};

export function VietnameseFoodAiIllustration({
  lookupLabel,
  metrics,
}: VietnameseFoodAiIllustrationProps) {
  return (
    <View
      accessibilityLabel="Tô phở bò trong khung camera tra cứu dinh dưỡng"
      accessibilityRole="image"
      className="relative h-[302px] overflow-hidden rounded-[28px] bg-peach">
      <Image
        contentFit="cover"
        source={images.vietnamesePho}
        style={{ height: '100%', width: '100%' }}
      />

      <View className="absolute left-5 top-5 size-10 rounded-tl-[12px] border-l-[3px] border-t-[3px] border-ink-navy" />
      <View className="absolute right-5 top-5 size-10 rounded-tr-[12px] border-r-[3px] border-t-[3px] border-ink-navy" />
      <View className="absolute bottom-5 left-5 size-10 rounded-bl-[12px] border-b-[3px] border-l-[3px] border-ink-navy" />
      <View className="absolute bottom-5 right-5 size-10 rounded-br-[12px] border-b-[3px] border-r-[3px] border-ink-navy" />
      <View className="absolute left-5 right-5 top-1/2 h-0.5 bg-apricot" />

      <View className="absolute bottom-11 left-5 right-5 flex-row justify-between gap-2">
        {metrics.map((metric) => (
          <View key={metric} className="rounded-xl bg-surface/95 px-3 py-2 shadow-sm">
            <Text className="font-sans text-[12px] font-bold text-ink-navy">{metric}</Text>
          </View>
        ))}
      </View>
      <View className="absolute bottom-2 self-center rounded-full bg-surface/95 px-3 py-1.5 shadow-sm">
        <Text className="font-sans text-[12px] font-bold text-ink-navy">{lookupLabel}</Text>
      </View>
    </View>
  );
}
