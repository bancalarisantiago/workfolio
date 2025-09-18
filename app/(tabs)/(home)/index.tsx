import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { signOut, isAuthLoading } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <View className="flex-1 gap-6 px-6 py-8">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Dashboard
          </Text>
          <Text className="text-base text-slate-500 dark:text-slate-400">
            This is the private home screen. Hook it up to your authenticated data sources.
          </Text>
        </View>

        <Pressable
          className={cn(
            'self-start rounded-xl bg-sky-600 px-5 py-3',
            isAuthLoading && 'opacity-60',
          )}
          disabled={isAuthLoading}
          onPress={signOut}
        >
          <Text className="text-base font-semibold text-white">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
