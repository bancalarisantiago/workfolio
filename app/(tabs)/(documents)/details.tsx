import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Linking,
} from 'react-native';

import { useEmployeeDocuments } from '@/hooks/useEmployeeDocuments';
import type { DocumentRecord, DocumentTypeKey } from '@/types/screens/documents';
import { DOCUMENT_TYPE_LABELS } from '@/types/screens/documents';
import type { DocumentStatus } from '@/types/db';

const PRIMARY_COLOR = '#0C6DD9';

const badgeStyles: Record<DocumentStatus, { label: string; background: string; color: string }> = {
  pending: { label: 'Pendiente', background: '#fef08a', color: '#854d0e' },
  signed: { label: 'Firmado', background: '#bbf7d0', color: '#166534' },
  rejected: { label: 'Rechazado', background: '#fecaca', color: '#991b1b' },
  expired: { label: 'Vencido', background: '#e5e7eb', color: '#4b5563' },
};

function DocumentRow({
  document,
  onPress,
  isDownloading,
}: {
  document: DocumentRecord;
  onPress: () => void;
  isDownloading: boolean;
}) {
  const badge = badgeStyles[document.status];

  return (
    <Pressable
      className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
      android_ripple={{ color: 'rgba(12, 109, 217, 0.12)' }}
      onPress={onPress}
      disabled={isDownloading}
    >
      <View className="rounded-xl bg-primary-50 p-3">
        <MaterialIcons
          name="picture-as-pdf"
          size={28}
          color={PRIMARY_COLOR}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-900">{document.title}</Text>
        {document.notes ? (
          <Text
            className="mt-1 text-xs text-slate-500"
            numberOfLines={2}
          >
            {document.notes}
          </Text>
        ) : null}
        {document.uploadedAt ? (
          <Text className="mt-1 text-xs text-slate-400">
            Subido el {new Date(document.uploadedAt).toLocaleDateString('es-AR')}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-2">
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
    </Pressable>
  );
}

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ type?: string }>();
  const type = (params.type ?? 'legajo') as DocumentTypeKey;
  const { groups, isLoading, error, refresh, downloadDocument } = useEmployeeDocuments();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: DOCUMENT_TYPE_LABELS[type] ?? 'Documentos',
    });
  }, [navigation, type]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const documents = useMemo(() => {
    const group = groups.find((item) => item.key === type);
    return group?.documents ?? [];
  }, [groups, type]);

  const handleDownload = useCallback(
    async (record: DocumentRecord) => {
      try {
        if (!record.filePath) {
          Alert.alert('Archivo no disponible', 'Este documento no tiene un archivo adjunto.');
          return;
        }

        setDownloadingId(record.id);
        const url = await downloadDocument(record);
        await Linking.openURL(url);
      } catch (err) {
        console.error('[DocumentDetailsScreen] download error', err);
        Alert.alert('Error', 'No pudimos descargar el documento. Intenta nuevamente.');
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadDocument],
  );

  const hasDocuments = documents.length > 0;

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
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: Platform.OS === 'android' ? 4 : 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {hasDocuments ? (
          <View className="gap-3">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                isDownloading={downloadingId === doc.id}
                onPress={() => handleDownload(doc)}
              />
            ))}
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

        {error ? (
          <View className="mt-6 rounded-3xl bg-white px-5 py-4">
            <Text className="text-sm text-rose-500">{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
