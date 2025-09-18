import { PropsWithChildren, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren<{ title: string }>) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = colorScheme === 'light' ? Colors.light.icon : Colors.dark.icon;

  return (
    <View className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-900/70">
      <Pressable
        className="flex-row items-center gap-2"
        onPress={() => setIsOpen((value) => !value)}
        accessibilityRole="button"
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          color={iconColor}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</Text>
      </Pressable>

      {isOpen ? <View className="mt-3 pl-6">{children}</View> : null}
    </View>
  );
}
