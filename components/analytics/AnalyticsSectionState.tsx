import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export type AnalyticsSectionStateProps = {
  status: 'loading' | 'empty' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
};

export function AnalyticsSectionState({ status, onRetry }: AnalyticsSectionStateProps) {
  if (status === 'loading') {
    return <View className="items-center justify-center rounded-2xl bg-white px-5 py-8 mx-4 mb-3" accessibilityLabel="Đang tải dữ liệu phân tích"><ActivityIndicator color="#8E9F8B" /><Text className="text-sm text-[#5E5C56] mt-3">Đang tải dữ liệu</Text></View>;
  }
  if (status === 'empty') {
    return <View className="items-center justify-center rounded-2xl bg-white px-5 py-8 mx-4 mb-3" accessibilityLabel="Chưa có dữ liệu phân tích"><Text className="text-sm text-[#5E5C56]">Chưa có dữ liệu để hiển thị</Text></View>;
  }
  return <View className="items-center justify-center rounded-2xl bg-white px-5 py-8 mx-4 mb-3" accessibilityLabel="Không thể tải dữ liệu phân tích"><Text className="text-sm text-[#5E5C56] text-center">Chúng tôi chưa thể tải dữ liệu lúc này.</Text><Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Thử lại tải dữ liệu" className="min-h-[44px] mt-3 px-4 rounded-full bg-[#EAF0ED] items-center justify-center"><Text className="text-sm font-semibold text-[#2F3542]">Thử lại</Text></Pressable></View>;
}
