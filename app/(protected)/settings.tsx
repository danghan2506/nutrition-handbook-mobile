import { useRouter } from 'expo-router';
import { Copy, LogOut, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pressable, ScrollView, Text, View } from '@/components/ui/tw';
import { ACCOUNT_SUMMARY_MOCK } from '@/data/personal-mock';
import { signOutCurrentUser } from '@/lib/auth';

const providerLabels = {
  GOOGLE: 'Google',
  PHONE: 'Số điện thoại',
  FACEBOOK: 'Facebook',
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const [account] = useState(ACCOUNT_SUMMARY_MOCK);
  const rows = [
    ['Email', account.email ?? 'Chưa liên kết'],
    ['Số điện thoại', account.phone ?? 'Chưa liên kết'],
    [
      'Phương thức đăng nhập',
      account.linkedProviders.map((provider) => providerLabels[provider]).join(' · '),
    ],
    [
      'Trạng thái tài khoản',
      account.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa',
    ],
  ] as const;
  const shortenedUid = `${account.userId.slice(0, 8)}…${account.userId.slice(-4)}`;

  const handleSignOut = async () => {
    const result = await signOutCurrentUser();

    if (!result.ok) {
      Alert.alert('Chưa thể đăng xuất', result.message);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có muốn đăng xuất khỏi tài khoản hiện tại không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            void handleSignOut();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12 pt-6">
        <View className="mx-auto w-full max-w-[440px]">
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            className="min-h-11 justify-center"
            onPress={() => router.back()}>
            <Text className="text-[16px] font-bold text-ink-navy">‹ Quay lại</Text>
          </Pressable>
          <Text
            accessibilityRole="header"
            className="mt-4 font-rounded text-[30px] font-extrabold text-ink-navy">
            Cài đặt
          </Text>

          <Text className="mt-7 text-[13px] font-extrabold tracking-[1px] text-label-slate">
            THÔNG TIN CƠ BẢN
          </Text>
          <View className="mt-3 rounded-[20px] bg-surface px-5">
            <View className="min-h-16 flex-row items-center border-b border-quiet-dot">
              <Text className="pr-4 text-[15px] font-bold text-ink-navy">UID</Text>
              <Text
                accessibilityLabel={`UID ${account.userId}`}
                className="flex-1 text-right text-[14px] text-soft-slate"
                numberOfLines={1}>
                {shortenedUid}
              </Text>
              <Pressable
                accessibilityHint="Hiển thị UID đầy đủ trong bản demo"
                accessibilityLabel="Sao chép UID"
                accessibilityRole="button"
                className="ml-3 h-11 w-11 items-center justify-center"
                onPress={() =>
                  Alert.alert(
                    'UID đầy đủ',
                    `${account.userId}\n\nBản demo chưa ghi vào bộ nhớ tạm.`,
                  )
                }>
                <Copy color="#697386" size={20} />
              </Pressable>
            </View>
            {rows.map(([label, value]) => (
              <View
                key={label}
                className="min-h-16 flex-row items-center justify-between border-b border-quiet-dot last:border-b-0">
                <Text className="pr-4 text-[15px] font-bold text-ink-navy">
                  {label}
                </Text>
                <Text
                  className="max-w-[190px] text-right text-[14px] text-soft-slate"
                  numberOfLines={1}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <Text className="mt-8 text-[13px] font-extrabold tracking-[1px] text-label-slate">
            TÀI KHOẢN VÀ BẢO MẬT
          </Text>
          <View className="mt-3 rounded-[20px] bg-surface px-5">
            <Pressable
              accessibilityLabel="Đăng xuất"
              accessibilityRole="button"
              className="min-h-16 flex-row items-center border-b border-quiet-dot"
              onPress={confirmSignOut}>
              <LogOut color="#2F3542" size={20} />
              <Text className="ml-3 text-[16px] font-bold text-ink-navy">
                Đăng xuất
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Xóa tài khoản và dữ liệu"
              accessibilityRole="button"
              className="min-h-16 flex-row items-center"
              onPress={() =>
                Alert.alert('Bản demo', 'Xóa tài khoản sẽ được kết nối sau.')
              }>
              <Trash2 color="#FF8B78" size={20} />
              <Text className="ml-3 text-[16px] font-bold text-coral-notice">
                Xóa tài khoản và dữ liệu
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
