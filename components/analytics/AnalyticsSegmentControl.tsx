import React from 'react';
import { View, Text, Pressable } from 'react-native';

export type AnalyticsTab = 'overview' | 'details';

interface AnalyticsSegmentControlProps {
  activeTab: AnalyticsTab;
  onSelectTab: (tab: AnalyticsTab) => void;
}

export const AnalyticsSegmentControl: React.FC<AnalyticsSegmentControlProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabClass = (selected: boolean): string =>
    'flex-1 py-3.5 rounded-xl items-center justify-center min-h-[44px] ' +
    (selected ? 'bg-[#FF9E7A]' : 'bg-transparent');

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row bg-[#F0EAE1] p-1 rounded-2xl mx-4 my-3"
    >
      <Pressable
        onPress={() => onSelectTab('overview')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'overview' }}
        accessibilityLabel="Tổng Quan"
        className={tabClass(activeTab === 'overview')}
      >
        <Text
          className={
            'font-semibold text-sm ' +
            (activeTab === 'overview' ? 'text-white' : 'text-[#697386]')
          }
        >
          Tổng Quan
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onSelectTab('details')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'details' }}
        accessibilityLabel="Chi Tiết Dinh Dưỡng"
        className={tabClass(activeTab === 'details')}
      >
        <Text
          className={
            'font-semibold text-sm ' +
            (activeTab === 'details' ? 'text-white' : 'text-[#697386]')
          }
        >
          Chi Tiết Dinh Dưỡng
        </Text>
      </Pressable>
    </View>
  );
};