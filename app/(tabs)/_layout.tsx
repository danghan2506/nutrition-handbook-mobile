import { Redirect, Tabs, type Href } from "expo-router";
import {
  ChartNoAxesColumnIncreasing,
  House,
  Soup,
  UserRound,
} from "lucide-react-native";
import { ActivityIndicator } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { View } from "@/components/ui/tw";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePersonalSessionBoundary } from "@/hooks/use-personal-session-boundary";

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
      className={`h-7 w-7 items-center justify-center rounded-xl ${
        focused ? "bg-[#FFF0E7]" : "bg-transparent"
      }`}
    >
      <Icon color={color} size={20} strokeWidth={2} />
    </View>
  );
}

export default function TabLayout() {
  const { isLoading, session } = useAuthSession();
  const isPersonalStateReady = usePersonalSessionBoundary(
    session?.user.id ?? null,
    isLoading,
  );

  if (isLoading) {
    return (
      <View
        accessibilityLabel="Đang tải..."
        className="flex-1 items-center justify-center bg-cloud"
      >
        <ActivityIndicator color="#FF9E7A" size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  if (!isPersonalStateReady) {
    return (
      <View
        accessibilityLabel="Đang tải..."
        className="flex-1 items-center justify-center bg-cloud"
      >
        <ActivityIndicator color="#FF9E7A" size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#FF9E7A",
        tabBarInactiveTintColor: "#697386",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E7DDD3",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 12,
          fontWeight: "600",
        },
      }}
    >
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
            <TabIcon
              color={color}
              focused={focused}
              Icon={ChartNoAxesColumnIncreasing}
            />
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
