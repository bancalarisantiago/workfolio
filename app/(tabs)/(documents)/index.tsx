import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export const DOCUMENT_TYPES = [
  { key: 'legajo', label: 'Legajo' },
  { key: 'recibos-anteriores', label: 'Recibos Anteriores' },
  { key: 'licencias', label: 'Licencias' },
  { key: 'sanciones', label: 'Sanciones' },
  { key: 'otros', label: 'Otros' },
] as const;

export type DocumentTypeKey = (typeof DOCUMENT_TYPES)[number]['key'];

const PRIMARY_COLOR = '#0C6DD9';

const folders = DOCUMENT_TYPES.map((type) => ({
  key: type.key,
  label: type.label,
  documents: type.key === 'licencias' ? 1 : 0,
  icon:
    type.key === 'legajo'
      ? ('folder' as const)
      : type.key === 'recibos-anteriores'
        ? ('receipt-long' as const)
        : type.key === 'licencias'
          ? ('medical-services' as const)
          : type.key === 'sanciones'
            ? ('gavel' as const)
            : ('insert-drive-file' as const),
}));

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
          <Text className="mt-2 text-sm text-primary-100">
            Revisa tus documentos organizados por categoría.
          </Text>
        </View>

        <View className="-mt-8 px-6">
          {folders.map((folder) => (
            <Pressable
              key={folder.key}
              className="mb-3 overflow-hidden rounded-3xl bg-white shadow-sm"
              android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
              onPress={() => {}}
            >
              <View className="flex-row items-center gap-4 px-5 py-5">
                <View className="rounded-2xl bg-primary-50 p-3">
                  <MaterialIcons
                    name={folder.icon}
                    size={28}
                    color={PRIMARY_COLOR}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900">{folder.label}</Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    {formatCount(folder.documents)}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={26}
                  color="#CBD5F5"
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Agregar carpeta"
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
