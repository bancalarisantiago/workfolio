import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaychecksScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <View className="flex-1 gap-4 px-6 py-8">
        <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Paychecks</Text>
        <Text className="text-base text-slate-500 dark:text-slate-400">
          Track pay history and upcoming payouts.
        </Text>
      </View>
    </SafeAreaView>
  );
}
