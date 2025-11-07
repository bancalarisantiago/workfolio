import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';

import { useEmployeePaychecks } from '@/hooks/useEmployeePaychecks';
import type { PaycheckEntry } from '@/types/screens/paychecks';
import type { PaycheckStatus } from '@/types/db';

const PRIMARY_COLOR = '#0C6DD9';
const STATUS_COLORS: Record<PaycheckStatus, string> = {
  signed: '#a7f3d0',
  unsigned: '#fde68a',
};

const enableLayoutAnimationExperimental = UIManager.setLayoutAnimationEnabledExperimental;
if (Platform.OS === 'android' && typeof enableLayoutAnimationExperimental === 'function') {
  enableLayoutAnimationExperimental(true);
}

function StatusBadge({ status }: { status: PaycheckStatus }) {
  const isSigned = status === 'signed';
  const label = isSigned ? 'Firmado' : 'Pendiente';
  const backgroundColor = STATUS_COLORS[status];

  return (
    <View
      className="rounded-xl px-3 py-1"
      style={{ backgroundColor }}
    >
      <Text className="text-xs font-semibold uppercase text-slate-700">{label}</Text>
    </View>
  );
}

function PaycheckItem({
  entry,
  onPress,
  isDownloading,
}: {
  entry: PaycheckEntry;
  onPress: () => void;
  isDownloading: boolean;
}) {
  return (
    <Pressable
      accessibilityHint="Descargar recibo"
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
      className="overflow-hidden rounded-3xl bg-white"
      onPress={onPress}
      disabled={isDownloading}
    >
      <View className="flex-row items-center gap-4 px-5 py-5">
        <View className="rounded-2xl bg-primary-50 p-3">
          <MaterialIcons
            name="description"
            size={26}
            color={PRIMARY_COLOR}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            {entry.label}
          </Text>
          <Text className="mt-1 text-xs text-slate-500">{entry.description}</Text>
          {entry.netAmount != null && entry.currency ? (
            <Text className="mt-1 text-xs text-slate-500">
              Neto {entry.currency} {entry.netAmount.toFixed(2)}
            </Text>
          ) : null}
        </View>
        <View className="items-end gap-2">
          <StatusBadge status={entry.status} />
          {isDownloading ? (
            <ActivityIndicator
              color={PRIMARY_COLOR}
              size="small"
            />
          ) : (
            <MaterialIcons
              name="download"
              size={20}
              color={PRIMARY_COLOR}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function PaychecksScreen() {
  const { groups, isLoading, error, refresh, downloadPaycheck } = useEmployeePaychecks();
  const [expandedYears, setExpandedYears] = useState<number[]>(() =>
    groups.map((group) => group.year),
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const toggleYear = (year: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year],
    );
  };

  const memoizedGroups = useMemo(() => groups, [groups]);

  const handleDownload = useCallback(
    async (entry: PaycheckEntry) => {
      try {
        setDownloadingId(entry.id);
        const url = await downloadPaycheck(entry);
        await Linking.openURL(url);
      } catch (err) {
        console.error('[PaychecksScreen] download error', err);
        Alert.alert('Error', 'No pudimos descargar el recibo. Intenta nuevamente.');
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadPaycheck],
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
          <Text className="mt-2 text-sm text-primary-100">
            Visualiza y descarga tus recibos por período.
          </Text>
        </View>

        <View className="-mt-8 px-6">
          {memoizedGroups.map((group) => {
            const isExpanded = expandedYears.includes(group.year);

            return (
              <View
                key={group.year}
                className="mb-4 overflow-hidden rounded-3xl bg-white"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Alternar recibos del ${group.year}`}
                  android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
                  className="flex-row items-center justify-between px-5 py-4"
                  onPress={() => toggleYear(group.year)}
                >
                  <Text className="text-base font-semibold text-slate-900">{group.year}</Text>
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={26}
                    color={PRIMARY_COLOR}
                  />
                </Pressable>

                {isExpanded ? (
                  <View className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                    <View className="gap-3">
                      {group.items.map((entry) => (
                        <PaycheckItem
                          key={entry.id}
                          entry={entry}
                          isDownloading={downloadingId === entry.id}
                          onPress={() => handleDownload(entry)}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}

          {error ? (
            <View className="mt-6 rounded-3xl bg-white px-5 py-4">
              <Text className="text-sm text-rose-500">{error}</Text>
            </View>
          ) : null}

          {memoizedGroups.every((group) => group.items.length === 0) && !isLoading ? (
            <View className="mt-6 items-center gap-3 rounded-3xl bg-white px-6 py-10">
              <MaterialIcons
                name="description"
                size={48}
                color={PRIMARY_COLOR}
              />
              <Text className="text-base font-semibold text-slate-900">
                Sin recibos disponibles
              </Text>
              <Text className="text-center text-sm text-slate-500">
                Cuando tu empresa publique nuevos recibos, aparecerán automáticamente aquí.
              </Text>
            </View>
          ) : null}

          {isLoading ? (
            <View className="mt-6 flex-row items-center justify-center gap-3">
              <ActivityIndicator color={PRIMARY_COLOR} />
              <Text className="text-sm text-slate-500">Actualizando recibos…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
