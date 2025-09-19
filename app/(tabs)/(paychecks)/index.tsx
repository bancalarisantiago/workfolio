import { Text, View } from 'react-native';

export default function PaychecksScreen() {
  return (
    <View className="flex-1 gap-6 px-6 py-8">
      <View className="gap-2">
        <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Paychecks</Text>
        <Text className="text-base text-slate-500 dark:text-slate-400">
          Track pay history and upcoming payouts.
        </Text>
      </View>
    </View>
  );
}
