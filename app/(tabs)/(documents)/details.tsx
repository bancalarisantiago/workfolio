import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import {
  DOCUMENT_TYPE_LABELS,
  documentMockData,
  type DocumentRecord,
  type DocumentTypeKey,
} from '@/types/screens/documents';

type CollapsibleGroup = {
  title: string;
  documents: DocumentRecord[];
};

const PRIMARY_COLOR = '#0C6DD9';

const badgeStyles = {
  signed: { label: 'Firmado', background: '#bbf7d0', color: '#166534' },
  pending: { label: 'Pendiente', background: '#fef08a', color: '#854d0e' },
};

function groupDocuments(type: DocumentTypeKey) {
  const bucket = documentMockData[type];
  if (!bucket) {
    return [] as CollapsibleGroup[];
  }

  const groupsMap = new Map<string, CollapsibleGroup>();

  for (const doc of bucket.documents) {
    const key = doc.category ?? 'Otros';
    if (!groupsMap.has(key)) {
      groupsMap.set(key, { title: key, documents: [] });
    }
    groupsMap.get(key)?.documents.push(doc);
  }

  if (groupsMap.size === 0) {
    return [] as CollapsibleGroup[];
  }

  return Array.from(groupsMap.values());
}

function DocumentRow({ title, status }: { title: string; status: 'signed' | 'pending' }) {
  const badge = badgeStyles[status];

  return (
    <Pressable
      className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
      android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
      onPress={() => {}}
    >
      <View className="rounded-xl bg-primary-50 p-3">
        <MaterialIcons
          name="picture-as-pdf"
          size={28}
          color={PRIMARY_COLOR}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-900">{title}</Text>
      </View>
      <View
        className="rounded-xl px-3 py-1"
        style={{ backgroundColor: badge.background }}
      >
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: badge.color }}
        >
          {badge.label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ type?: string }>();
  const type = (params.type ?? 'legajo') as DocumentTypeKey;

  useEffect(() => {
    navigation.setOptions({
      title: DOCUMENT_TYPE_LABELS[type] ?? 'Documentos',
    });
  }, [navigation, type]);

  const groupedDocuments = useMemo(() => groupDocuments(type), [type]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedGroups(new Set(groupedDocuments.map((group) => group.title)));
  }, [groupedDocuments]);

  const toggleGroup = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const hasDocuments = groupedDocuments.length > 0;

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: Platform.OS === 'android' ? 4 : 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {hasDocuments ? (
          <View className="gap-4">
            {groupedDocuments.map((group) => {
              const isExpanded = expandedGroups.has(group.title);
              return (
                <View
                  key={group.title}
                  className="overflow-hidden rounded-3xl bg-white"
                >
                  <Pressable
                    className="flex-row items-center justify-between px-5 py-4"
                    android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
                    onPress={() => toggleGroup(group.title)}
                  >
                    <Text className="text-base font-semibold text-slate-900">{group.title}</Text>
                    <MaterialIcons
                      name={isExpanded ? 'expand-less' : 'expand-more'}
                      size={26}
                      color={PRIMARY_COLOR}
                    />
                  </Pressable>
                  {isExpanded ? (
                    <View className="gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4">
                      {group.documents.map((doc) => (
                        <DocumentRow
                          key={doc.id}
                          title={doc.title}
                          status={doc.status}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center gap-4 rounded-3xl bg-white px-6 py-12">
            <MaterialIcons
              name="insert-drive-file"
              size={64}
              color={PRIMARY_COLOR}
            />
            <Text className="text-base font-semibold text-slate-900">Sin documentos</Text>
            <Text className="text-center text-sm text-slate-500">
              Aún no hay documentos para esta categoría. Cuando tu empresa cargue archivos,
              aparecerán aquí.
            </Text>
            <Pressable
              className="mt-2 rounded-full border border-primary-200 px-5 py-2"
              onPress={() => router.back()}
            >
              <Text className="text-sm font-semibold text-primary-700">Volver</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
