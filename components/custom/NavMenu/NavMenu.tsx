import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NavMenuProps } from './types';

const SLIDE_DURATION = 220;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);
const PRIMARY_COLOR = '#0C6DD9';
const PRIMARY_PRESSED = 'rgba(12, 109, 217, 0.18)';

export function NavMenu({ visible, onClose, onNavigate, onLogout, user }: NavMenuProps) {
  const animation = useRef(new Animated.Value(0)).current;
  const logoutIconColor = '#ffffff';
  const insets = useSafeAreaInsets();

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

  const initials = useMemo(() => {
    if (!user) {
      return 'IN';
    }
    const firstInitial = user.firstName?.[0] ?? '';
    const lastInitial = user.lastName?.[0] ?? '';
    const combined = `${firstInitial}${lastInitial}`.trim();
    return combined !== '' ? combined.toUpperCase() : 'IN';
  }, [user]);

  const handleSelection = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await onLogout();
  };

  type FeatherIconName = ComponentProps<typeof Feather>['name'];

  const menuItems: { key: string; label: string; path: string; icon: FeatherIconName }[] = [
    { key: 'home', label: 'Home', path: '/(tabs)/(home)', icon: 'home' },
    { key: 'paychecks', label: 'Recibos', path: '/(tabs)/(paychecks)', icon: 'credit-card' },
    { key: 'documents', label: 'Documents', path: '/(tabs)/(documents)', icon: 'file-text' },
    { key: 'settings', label: 'Configuración', path: '/settings', icon: 'settings' },
    { key: 'change-pin', label: 'Change PIN', path: '/change-pin', icon: 'lock' },
  ];

  return (
    <View
      className="absolute inset-0 z-50"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <Animated.View
        className="absolute inset-0 bg-slate-950/70"
        style={{ opacity: backdropOpacity }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        className="absolute top-0 bottom-0 right-0"
        style={{
          width: MENU_WIDTH,
          transform: [{ translateX }],
          boxShadow: '0px 24px 48px rgba(15, 23, 42, 0.35)',
        }}
      >
        <View
          className="flex-1 bg-white px-7 pb-16 dark:bg-zinc-900"
          style={{ paddingTop: insets.top + 28 }}
        >
          <View className="rounded-3xl bg-primary-600 px-5 py-6">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
                <Text className="text-xl font-semibold uppercase text-white">{initials}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-2xl font-semibold text-white">{displayName}</Text>
                <Text className="text-base text-primary-100">{cuilValue}</Text>
              </View>
            </View>
          </View>

          <View className="mt-10 gap-4">
            {menuItems.map((item) => (
              <Pressable
                key={item.key}
                android_ripple={{ color: PRIMARY_PRESSED, borderless: false }}
                onPress={() => handleSelection(item.path)}
                className="overflow-hidden rounded-3xl"
                style={({ pressed, hovered }) => ({
                  backgroundColor: pressed
                    ? 'rgba(12, 109, 217, 0.16)'
                    : hovered
                      ? 'rgba(12, 109, 217, 0.12)'
                      : 'rgba(12, 109, 217, 0.08)',
                })}
              >
                {({ pressed, hovered }) => {
                  const tint = pressed || hovered ? PRIMARY_COLOR : '#1e293b';
                  return (
                    <View className="flex-row items-center gap-4 px-5 py-4">
                      <Feather
                        name={item.icon}
                        size={24}
                        color={tint}
                      />
                      <Text
                        className="text-lg font-semibold text-slate-900"
                        style={{ color: tint }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                }}
              </Pressable>
            ))}
          </View>

          <View className="mt-auto pb-6">
            <Pressable
              className="flex-row items-center justify-center gap-3 rounded-2xl bg-primary-600 px-5 py-4"
              onPress={() => {
                void handleLogout();
              }}
            >
              <Feather
                name="log-out"
                size={26}
                color={logoutIconColor}
              />
              <Text className="text-center text-lg font-semibold text-white">Salir</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
