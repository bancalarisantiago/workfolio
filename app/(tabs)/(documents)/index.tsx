import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DOCUMENT_TYPE_LABELS, documentMockData } from '@/types/screens/documents';

const PRIMARY_COLOR = '#0C6DD9';

function formatCount(count: number) {
  return `${count} documento${count === 1 ? '' : 's'}`;
}

export default function DocumentsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-b-[32px] bg-primary-600 px-6 pb-14 pt-6 shadow-md">
          <Text className="text-2xl font-semibold text-white">Carpetas</Text>
          <Text className="mt-2 text-sm text-primary-100">
            Revisa tus documentos organizados por categoría.
          </Text>
        </View>

        <View className="-mt-8 px-6">
          {Object.entries(documentMockData).map(([key, group]) => (
            <Fragment key={key}>
              <Pressable
                accessibilityRole="button"
                className="mb-3 overflow-hidden rounded-3xl bg-white shadow-sm"
                android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(documents)/details',
                    params: { type: key },
                  })
                }
              >
                <View className="flex-row items-center gap-4 px-5 py-5">
                  <View className="rounded-2xl bg-primary-50 p-3">
                    <MaterialIcons
                      name={group.icon}
                      size={28}
                      color={PRIMARY_COLOR}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-900">
                      {DOCUMENT_TYPE_LABELS[key as keyof typeof DOCUMENT_TYPE_LABELS]}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      {formatCount(group.documents.length)}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={26}
                    color="#CBD5F5"
                  />
                </View>
              </Pressable>
            </Fragment>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Agregar documento"
        accessibilityRole="button"
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary-600 shadow-lg"
        onPress={() => router.push('/(tabs)/(documents)/upload')}
      >
        <MaterialIcons
          name="add"
          size={30}
          color="#ffffff"
        />
      </Pressable>
    </View>
  );
}
