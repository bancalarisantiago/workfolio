import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fragment, useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { useEmployeeDocuments } from '@/hooks/useEmployeeDocuments';
import { DOCUMENT_TYPE_LABELS } from '@/types/screens/documents';

const PRIMARY_COLOR = '#0C6DD9';

function formatCount(count: number) {
  return `${count} documento${count === 1 ? '' : 's'}`;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const { groups, isLoading, error, refresh } = useEmployeeDocuments();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={PRIMARY_COLOR}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-b-[32px] bg-primary-600 px-6 pb-14 pt-6">
          <Text className="text-2xl font-semibold text-white">Carpetas</Text>
          <Text className="mt-2 text-sm text-primary-100">
            Revisa tus documentos organizados por categoría.
          </Text>
        </View>

        <View className="-mt-8 px-6">
          {groups.map((group) => (
            <Fragment key={group.key}>
              <Pressable
                accessibilityRole="button"
                className="mb-3 overflow-hidden rounded-3xl bg-white"
                android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(documents)/details',
                    params: { type: group.key },
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
                      {DOCUMENT_TYPE_LABELS[group.key]}
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

          {error ? (
            <View className="mt-6 rounded-3xl bg-white px-5 py-4">
              <Text className="text-sm text-rose-500">{error}</Text>
            </View>
          ) : null}

          {groups.every((group) => group.documents.length === 0) && !isLoading ? (
            <View className="mt-6 items-center gap-3 rounded-3xl bg-white px-6 py-10">
              <MaterialIcons
                name="insert-drive-file"
                size={48}
                color={PRIMARY_COLOR}
              />
              <Text className="text-base font-semibold text-slate-900">Sin documentos aún</Text>
              <Text className="text-center text-sm text-slate-500">
                Cuando cargues documentos o tu empresa los comparta, aparecerán aquí.
              </Text>
            </View>
          ) : null}

          {isLoading ? (
            <View className="mt-6 flex-row items-center justify-center gap-3">
              <ActivityIndicator color={PRIMARY_COLOR} />
              <Text className="text-sm text-slate-500">Actualizando documentos…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Agregar documento"
        accessibilityRole="button"
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary-600"
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
