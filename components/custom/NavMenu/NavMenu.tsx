import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import type { NavMenuUser } from './types';

const SLIDE_DURATION = 220;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);
const PRIMARY_COLOR = '#0C6DD9';
const PRIMARY_HOVER = 'rgba(12, 109, 217, 0.08)';
const PRIMARY_PRESSED = 'rgba(12, 109, 217, 0.18)';

export function NavMenu({ visible, onClose, onNavigate, onLogout, user }: NavMenuUser) {
  const animation = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#e2e8f0' : '#1e293b';
  const logoutIconColor = '#ffffff';

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [animation, visible]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [MENU_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const displayName = useMemo(() => {
    if (!user) {
      return 'Invitado';
    }

    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Invitado';
  }, [user]);

  const cuilValue = user?.cuil ?? 'CUIL no disponible';

  const handleSelection = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  type FeatherIconName = ComponentProps<typeof Feather>['name'];

  const menuItems: { key: string; label: string; path: string; icon: FeatherIconName }[] = [
    { key: 'home', label: 'Home', path: '/(tabs)/(home)', icon: 'home' },
    { key: 'paychecks', label: 'Paychecks', path: '/(tabs)/(paychecks)', icon: 'credit-card' },
    { key: 'documents', label: 'Documents', path: '/(tabs)/(documents)', icon: 'file-text' },
    { key: 'change-pin', label: 'Change PIN', path: '/change-pin', icon: 'lock' },
  ];

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: MENU_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      >
        <View className="flex-1 bg-white px-6 py-10 pb-16 dark:bg-zinc-900">
          <View className="gap-1">
            <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">{cuilValue}</Text>
          </View>

          <View className="mt-10 gap-3">
            {menuItems.map((item) => (
              <Pressable
                key={item.key}
                android_ripple={{ color: PRIMARY_PRESSED, borderless: false }}
                onPress={() => handleSelection(item.path)}
                style={({ pressed, hovered }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: PRIMARY_PRESSED },
                  !pressed && hovered && { backgroundColor: PRIMARY_HOVER },
                ]}
              >
                {({ pressed, hovered }) => (
                  <View className="flex-row items-center gap-3">
                    <Feather
                      name={item.icon}
                      size={20}
                      color={pressed || hovered ? PRIMARY_COLOR : iconColor}
                    />
                    <Text
                      className="text-base font-medium text-slate-900 dark:text-slate-100"
                      style={{ color: pressed || hovered ? PRIMARY_COLOR : undefined }}
                    >
                      {item.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          <View className="mt-auto pb-6">
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3"
              onPress={handleLogout}
            >
              <Feather
                name="log-out"
                size={20}
                color={logoutIconColor}
              />
              <Text className="text-center text-base font-semibold text-white">Salir</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    elevation: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: -4, height: 0 },
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
  menuItem: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
