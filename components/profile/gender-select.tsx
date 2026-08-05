import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GENDER_OPTIONS, profileCopy } from '@/constants/profile';
import type { Gender } from '@/types/profile';

type GenderSelectProps = {
  value: Gender | null;
  error?: string;
  onChange: (value: Gender) => void;
};

export function GenderSelect({ value, error, onChange }: GenderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = GENDER_OPTIONS.find((option) => option.value === value);

  return (
    <View className="min-w-0 flex-1">
      <Text className="mb-2 text-[14px] font-bold text-ink-navy">
        {profileCopy.genderLabel}
      </Text>
      <Pressable
        accessibilityLabel={profileCopy.genderLabel}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isOpen }}
        accessibilityValue={{
          text: selected?.label ?? profileCopy.genderPlaceholder,
        }}
        className={`h-[57px] flex-row items-center rounded-[17px] border bg-surface px-3 ${
          error ? 'border-coral-notice' : 'border-quiet-dot'
        }`}
        onPress={() => setIsOpen(true)}>
        <Text
          className={`min-w-0 flex-1 text-[14px] font-bold ${
            selected ? 'text-ink-navy' : 'text-soft-slate'
          }`}
          numberOfLines={1}>
          {selected?.label ?? profileCopy.genderPlaceholder}
        </Text>
        <Ionicons color="#697386" name="chevron-down" size={18} />
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" className="mt-2 text-[13px] text-coral-notice">
          {error}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}>
        <SafeAreaView
          accessibilityViewIsModal
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(47,53,66,0.3)' }}>
          <Pressable
            accessibilityLabel="Đóng danh sách giới tính"
            className="flex-1"
            onPress={() => setIsOpen(false)}
          />
          <View className="rounded-t-[24px] bg-surface px-5 pb-4 pt-5">
            <Text className="mb-3 text-[18px] font-extrabold text-ink-navy">
              {profileCopy.genderLabel}
            </Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: value === option.value }}
                className="min-h-14 flex-row items-center justify-between border-b border-quiet-dot"
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}>
                <Text className="text-[16px] font-semibold text-ink-navy">
                  {option.label}
                </Text>
                {value === option.value ? (
                  <Ionicons color="#FF9E7A" name="checkmark" size={22} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
