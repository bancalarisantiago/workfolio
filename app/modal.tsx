import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-zinc-950">
      <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
        This is a modal
      </Text>
      <Link
        href="/(tabs)/(home)"
        dismissTo
        className="mt-6 rounded-full px-4 py-3"
      >
        <Text className="text-base font-semibold text-sky-600 dark:text-sky-400">
          Go to home screen
        </Text>
      </Link>
    </View>
  );
}
