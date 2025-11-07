import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

const PRIMARY_COLOR = '#0C6DD9';

export default function HomeScreen() {
  const { signOut, isAuthLoading, user } = useAuth();

  const pendingCards = [
    {
      id: 'receipts',
      title: '¡Así se hace!',
      description: 'No tienes recibos para firmar',
    },
    {
      id: 'documents',
      title: '¡Bien!',
      description: 'No tienes documentos para firmar',
    },
  ];

  const toUpper = (value?: string | null) => (value ? value.toUpperCase() : undefined);
  const greetingName = toUpper(user?.firstName) ?? 'USUARIO';
  const formattedFullName = user
    ? [toUpper(user?.lastName), toUpper(user?.firstName)].filter(Boolean).join(', ') ||
      'Usuario Invitado'
    : 'Usuario Invitado';

  return (
    <ScrollView
      className="flex-1 bg-slate-100"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="rounded-b-[32px] bg-primary-600 px-6 pb-12 pt-2">
        <Text className="mt-10 text-2xl font-semibold uppercase text-white">
          ¡Bienvenido {greetingName}!
        </Text>
        <Text className="mt-3 text-base text-primary-100">
          Revisa tus documentos pendientes y las novedades de tu empresa.
        </Text>
      </View>

      <View className="-mt-10 px-6">
        <View className="rounded-3xl bg-white p-5">
          <View className="flex-row items-center">
            <View className="rounded-full bg-primary-100 p-4">
              <MaterialIcons
                name="person"
                size={32}
                color={PRIMARY_COLOR}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-slate-900">{formattedFullName}</Text>
              <Text className="mt-1 text-sm font-medium text-primary-600">
                CUIL: {user?.cuil ?? '—'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-semibold text-primary-700">
                {user?.companyName ?? 'WorkFolio'}
              </Text>
              {user?.companyDescription ? (
                <Text className="text-xs text-slate-500">{user.companyDescription}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <View className="mt-5">
          {pendingCards.map((card, index) => (
            <View
              key={card.id}
              className={cn('flex-row items-center rounded-3xl bg-white p-5', index > 0 && 'mt-4')}
            >
              <View className="rounded-full border border-primary-200 p-3">
                <MaterialIcons
                  name="check-circle"
                  size={28}
                  color={PRIMARY_COLOR}
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-slate-900">{card.title}</Text>
                <Text className="mt-1 text-sm text-slate-500">{card.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-5 items-center rounded-3xl bg-white px-6 py-10">
          <View className="rounded-full bg-primary-100 p-4">
            <MaterialIcons
              name="mark-email-read"
              size={32}
              color={PRIMARY_COLOR}
            />
          </View>
          <Text className="mt-4 text-center text-sm text-slate-500">
            Por el momento tu empresa no subió nuevas publicaciones
          </Text>
        </View>

        <Pressable
          className={cn(
            'mt-8 self-center rounded-full border border-primary-100 px-6 py-3',
            isAuthLoading && 'opacity-60',
          )}
          disabled={isAuthLoading}
          onPress={() => {
            void (async () => {
              try {
                await signOut();
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : 'No pudimos cerrar tu sesión.';
                Alert.alert('Error al cerrar sesión', message);
              }
            })();
          }}
        >
          <Text className="text-base font-semibold text-primary-700">Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
