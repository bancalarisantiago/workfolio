import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(documents)"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="doc.text"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(paychecks)"
        options={{
          title: 'Paychecks',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="creditcard.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
