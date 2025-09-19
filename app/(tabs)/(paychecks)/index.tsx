import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';

import type { PaycheckEntry, PaycheckGroup, PaycheckStatus } from '@/types/screens/paychecks';

const PRIMARY_COLOR = '#0C6DD9';
const STATUS_COLORS: Record<PaycheckStatus, string> = {
  signed: '#a7f3d0',
  pending: '#fde68a',
};

const months2025 = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const paycheckData: PaycheckGroup[] = [
  {
    year: 2025,
    items: months2025.map((month, index) => ({
      id: `2025-${index}`,
      month: `${month}. 2025`,
      description: 'Mensual (Pág. 1)',
      status: 'signed',
    })),
  },
  {
    year: 2024,
    items: ['Nov', 'Dic'].map((month, index) => ({
      id: `2024-${index}`,
      month: `${month}. 2024`,
      description: 'Mensual (Pág. 1)',
      status: index === 0 ? 'pending' : 'signed',
    })),
  },
  {
    year: 2023,
    items: ['Nov', 'Dic'].map((month, index) => ({
      id: `2023-${index}`,
      month: `${month}. 2023`,
      description: 'Mensual (Pág. 1)',
      status: 'signed',
    })),
  },
];

// Expo SDK 53 enables the new architecture by default on Android, where the
// LayoutAnimation experimental flag is a no-op and logs warnings. Calling the
// method only when it actually exists and returns a function keeps compatibility
// with the old architecture without triggering warnings.
const enableLayoutAnimationExperimental = UIManager.setLayoutAnimationEnabledExperimental;
if (Platform.OS === 'android' && typeof enableLayoutAnimationExperimental === 'function') {
  enableLayoutAnimationExperimental(true);
}

function StatusBadge({ status }: { status: PaycheckStatus }) {
  const label = status === 'signed' ? 'Firmado' : 'Pendiente';
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

function PaycheckItem({ entry }: { entry: PaycheckEntry }) {
  return (
    <Pressable
      accessibilityHint="Ver detalle del recibo"
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
      className="overflow-hidden rounded-3xl bg-white"
      onPress={() => {}}
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
            {entry.month}
          </Text>
          <Text className="mt-1 text-xs text-slate-500">{entry.description}</Text>
        </View>
        <StatusBadge status={entry.status} />
      </View>
    </Pressable>
  );
}

export default function PaychecksScreen() {
  const [expandedYears, setExpandedYears] = useState(() => paycheckData.map((group) => group.year));

  const toggleYear = (year: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year],
    );
  };

  const groups = useMemo(() => paycheckData, []);

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-b-[32px] bg-primary-600 px-6 pb-14 pt-6 shadow-md">
          <Text className="mt-2 text-sm text-primary-100">
            Visualiza y descarga tus recibos por período.
          </Text>
        </View>

        <View className="-mt-8 px-6">
          {groups.map((group) => {
            const isExpanded = expandedYears.includes(group.year);

            return (
              <View
                key={group.year}
                className="mb-4 overflow-hidden rounded-3xl bg-white shadow-sm"
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
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
