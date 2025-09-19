import { Text, View } from 'react-native';

export default function DocumentsScreen() {
  return (
    <View className="flex-1 gap-6 px-6 py-8">
      <View className="gap-2">
        <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Documents</Text>
        <Text className="text-base text-slate-500 dark:text-slate-400">
          Upload and manage your work documents here.
        </Text>
      </View>
    </View>
  );
}
