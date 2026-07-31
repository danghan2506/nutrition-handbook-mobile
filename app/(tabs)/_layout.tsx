import { Redirect, Tabs, type Href } from 'expo-router';
import {
  ChartNoAxesColumnIncreasing,
  House,
  Soup,
  UserRound,
} from 'lucide-react-native';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { View } from '@/components/ui/tw';
import { useAuthSession } from '@/hooks/use-auth-session';

function TabIcon({
  color,
  focused,
  Icon,
}: {
  color: string;
  focused: boolean;
  Icon: typeof House;
}) {
  return (
    <View
      className={`h-11 w-11 items-center justify-center rounded-2xl ${
        focused ? 'bg-[#FFF0E7]' : 'bg-transparent'
      }`}>
      <Icon color={color} size={23} strokeWidth={2} />
    </View>
  );
}

export default function TabLayout() {
  const { isLoading, session } = useAuthSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#FF9E7A',
        tabBarInactiveTintColor: '#697386',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7DDD3',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hôm nay',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={House} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Phân tích',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={ChartNoAxesColumnIncreasing} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Bữa ăn',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Soup} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Bạn',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={UserRound} />
          ),
        }}
      />
    </Tabs>
  );
}
