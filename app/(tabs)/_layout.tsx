import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { NavMenu } from '@/components/custom/NavMenu';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleNavigate = (path: string) => {
    if (path.startsWith('/(tabs)')) {
      router.navigate(path as never);
    } else {
      router.push(path as never);
    }
  };

  const palette = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Tabs
        sceneContainerStyle={{
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        }}
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
          tabBarStyle: {
            backgroundColor: palette.background,
            borderTopWidth: 0,
            paddingVertical: 8,
            paddingBottom: 14,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarButton: HapticTab,
          headerShown: true,
          headerStyle: {
            backgroundColor: palette.tint,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: '#ffffff',
          },
          headerTintColor: '#ffffff',
          headerTitleAlign: 'center',
          headerRightContainerStyle: {
            paddingRight: 12,
          },
          headerLeftContainerStyle: {
            paddingLeft: 16,
          },
          headerTitle:
            route.name === '(home)'
              ? 'Inicio'
              : route.name === '(documents)'
                ? 'Documentos'
                : route.name === '(paychecks)'
                  ? 'Recibos'
                  : route.name,
          headerRight: () => (
            <Pressable
              accessibilityLabel="Abrir menú"
              accessibilityRole="button"
              onPress={() => setIsMenuOpen(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 8,
                paddingVertical: 4,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Feather
                name="menu"
                size={22}
                color="#ffffff"
              />
            </Pressable>
          ),
        })}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Inicio',
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
            title: 'Documentos',
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
      <NavMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        onLogout={() => {
          setIsMenuOpen(false);
          signOut();
        }}
        user={user}
      />
    </>
  );
}
