import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { PermissionModal } from '@/components/custom/PermissionModal';
import {
  DOCUMENT_TYPE_KEYS,
  DOCUMENT_TYPES,
  type DocumentTypeKey,
  type PermissionPrompt,
  type SelectedFile,
  type UploadFormValues,
} from '@/types/screens/documents';

const PRIMARY_COLOR = '#0C6DD9';

const uploadSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE_KEYS, { message: 'Selecciona un tipo de documento' }),
  notes: z
    .string()
    .max(500, 'Las observaciones no pueden superar los 500 caracteres')
    .optional()
    .or(z.literal('')),
  fileUri: z.string().min(1, 'Adjunta una foto o archivo para continuar'),
});

export default function UploadDocumentScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [permissionPrompt, setPermissionPrompt] = useState<PermissionPrompt | null>(null);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    reset,
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentType: undefined as unknown as DocumentTypeKey,
      notes: '',
      fileUri: '',
    },
  });
  const documentType = watch('documentType');

  const selectedDocumentLabel = useMemo(() => {
    return (
      DOCUMENT_TYPES.find((option) => option.key === documentType)?.label ?? 'Tipo de documento'
    );
  }, [documentType]);

  const capturePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file: SelectedFile = {
        uri: asset.uri,
        name: asset.fileName ?? `captura-${Date.now()}.jpg`,
        mimeType: asset.mimeType,
        isImage: true,
      };
      setSelectedFile(file);
      setValue('fileUri', file.uri, { shouldValidate: true });
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      const file: SelectedFile = {
        uri: asset.uri,
        name: asset.name ?? 'archivo-adjunto',
        mimeType: asset.mimeType,
        isImage: Boolean(asset.mimeType?.startsWith('image/')),
      };

      setSelectedFile(file);
      setValue('fileUri', file.uri, { shouldValidate: true });
    } catch (error) {
      console.warn('DocumentPicker error', error);
      Alert.alert('No se pudo adjuntar', 'Intenta nuevamente seleccionar tu archivo.');
    }
  };

  const ensureCameraAccess = async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();

    if (current.granted) {
      await capturePhoto();
      return;
    }

    if (current.status === ImagePicker.PermissionStatus.DENIED && !current.canAskAgain) {
      Alert.alert('Permiso requerido', 'Habilita el acceso a la cámara desde Ajustes.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
      ]);
      return;
    }

    const request = await ImagePicker.requestCameraPermissionsAsync();

    if (request.status === ImagePicker.PermissionStatus.GRANTED) {
      await capturePhoto();
      return;
    }

    if (!request.canAskAgain) {
      Alert.alert('Permiso denegado', 'No se pudo acceder a la cámara.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
      ]);
      return;
    }

    setPermissionPrompt({
      type: 'camera',
      onAllow: async () => {
        const retry = await ImagePicker.requestCameraPermissionsAsync();
        if (retry.status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert('Permiso denegado', 'No se pudo acceder a la cámara.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
          ]);
          return;
        }
        await capturePhoto();
      },
    });
  };

  const ensureMediaLibraryAccess = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (current.granted) {
      await pickDocument();
      return;
    }

    if (current.status === ImagePicker.PermissionStatus.DENIED && !current.canAskAgain) {
      Alert.alert('Permiso requerido', 'Habilita el acceso a tus archivos desde Ajustes.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
      ]);
      return;
    }

    const request = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (request.status === ImagePicker.PermissionStatus.GRANTED) {
      await pickDocument();
      return;
    }

    if (!request.canAskAgain) {
      Alert.alert('Permiso denegado', 'No se pudo acceder a tus archivos.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
      ]);
      return;
    }

    setPermissionPrompt({
      type: 'file',
      onAllow: async () => {
        const retry = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (retry.status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert('Permiso denegado', 'No se pudo acceder a tus archivos.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
          ]);
          return;
        }
        await pickDocument();
      },
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue('fileUri', '', { shouldValidate: true });
  };

  const onSubmit = async (values: UploadFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    Alert.alert('Documento enviado', 'Tu documento fue cargado satisfactoriamente.');
    reset();
    setSelectedFile(null);
    router.back();
  };

  const permissionCopy = useMemo(() => {
    if (!permissionPrompt) {
      return null;
    }

    if (permissionPrompt.type === 'camera') {
      return {
        title: 'Permitir acceso a la cámara',
        description:
          'Necesitamos tu permiso para tomar una fotografía del documento desde la aplicación.',
      };
    }

    return {
      title: 'Permitir acceso a tus archivos',
      description:
        'Autoriza el acceso a la galería o archivos para adjuntar un documento existente.',
    };
  }, [permissionPrompt]);

  const executePermissionAction = async () => {
    if (!permissionPrompt) {
      return;
    }

    const { onAllow } = permissionPrompt;
    setPermissionPrompt(null);
    await onAllow();
  };

  return (
    <View className="flex-1 bg-slate-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <Text className="mt-2 text-sm text-slate-500">
              Adjunta una foto o archivo existente y completa los datos requeridos.
            </Text>
          </View>

          <View className="mt-4 px-6">
            <View className="items-center rounded-3xl bg-white px-6 py-8">
              {selectedFile ? (
                selectedFile.isImage ? (
                  <Image
                    source={{ uri: selectedFile.uri }}
                    className="h-40 w-40 rounded-2xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center gap-3">
                    <MaterialIcons
                      name="description"
                      size={64}
                      color={PRIMARY_COLOR}
                    />
                    <Text className="text-sm font-medium text-slate-900">{selectedFile.name}</Text>
                  </View>
                )
              ) : (
                <MaterialIcons
                  name="description"
                  size={84}
                  color={PRIMARY_COLOR}
                />
              )}

              <Text className="mt-6 text-center text-sm text-slate-500">
                Toma una foto o selecciona el archivo desde tu dispositivo.
              </Text>

              <View className="mt-6 w-full flex-row gap-3">
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-primary-200 px-4 py-3"
                  onPress={ensureCameraAccess}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text className="text-sm font-semibold text-primary-700">Tomar foto</Text>
                </Pressable>

                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-primary-200 px-4 py-3"
                  onPress={ensureMediaLibraryAccess}
                >
                  <MaterialIcons
                    name="upload-file"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text className="text-sm font-semibold text-primary-700">Subir archivo</Text>
                </Pressable>
              </View>

              {selectedFile ? (
                <Pressable
                  className="mt-4"
                  onPress={handleRemoveFile}
                >
                  <Text className="text-xs font-semibold uppercase text-slate-400">
                    Eliminar adjunto
                  </Text>
                </Pressable>
              ) : null}

              {errors.fileUri ? (
                <Text className="mt-4 text-center text-xs font-semibold text-rose-500">
                  {errors.fileUri.message}
                </Text>
              ) : null}
            </View>

            <View className="mt-8">
              <Controller
                control={control}
                name="documentType"
                render={({ field: { value }, fieldState: { error } }) => (
                  <View>
                    <Text className="text-xs font-semibold uppercase text-slate-500">
                      Tipo de documento
                    </Text>
                    <Pressable
                      className="mt-2 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      onPress={() => setTypeModalVisible(true)}
                    >
                      <Text className="text-sm font-medium text-slate-900">
                        {value ? selectedDocumentLabel : 'Selecciona un tipo'}
                      </Text>
                      <MaterialIcons
                        name="expand-more"
                        size={22}
                        color="#94a3b8"
                      />
                    </Pressable>
                    {error ? (
                      <Text className="mt-2 text-xs font-semibold text-rose-500">
                        {error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            <View className="mt-6">
              <Controller
                control={control}
                name="notes"
                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                  <View>
                    <Text className="text-xs font-semibold uppercase text-slate-500">
                      Observaciones (opcional)
                    </Text>
                    <TextInput
                      className="mt-2 min-h-[112px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                      placeholder="Escribe un mensaje para tu empleador"
                      placeholderTextColor="#94a3b8"
                      multiline
                      value={value ?? ''}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      textAlignVertical="top"
                    />
                    {error ? (
                      <Text className="mt-2 text-xs font-semibold text-rose-500">
                        {error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            <Pressable
              className={`mt-8 rounded-full bg-primary-600 px-6 py-4 ${isSubmitting ? 'opacity-60' : ''}`}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text className="text-center text-base font-semibold uppercase text-white">
                Enviar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PermissionModal
        visible={Boolean(permissionPrompt)}
        title={permissionCopy?.title ?? ''}
        description={permissionCopy?.description ?? ''}
        onCancel={() => setPermissionPrompt(null)}
        onConfirm={executePermissionAction}
      />

      <DocumentTypeModal
        visible={typeModalVisible}
        selectedKey={documentType}
        onClose={() => setTypeModalVisible(false)}
        onSelect={(key) => {
          setValue('documentType', key, { shouldValidate: true });
          setTypeModalVisible(false);
        }}
      />
    </View>
  );
}

function DocumentTypeModal({
  visible,
  onClose,
  onSelect,
  selectedKey,
}: {
  visible: boolean;
  selectedKey?: DocumentTypeKey;
  onClose: () => void;
  onSelect: (key: DocumentTypeKey) => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-slate-900/60"
        onPress={onClose}
      >
        <View className="mt-auto rounded-t-3xl bg-white px-6 pb-10 pt-6">
          <View className="mb-4 h-1 self-center w-16 rounded-full bg-slate-200" />
          <Text className="mb-4 text-base font-semibold text-slate-900">Selecciona un tipo</Text>
          {DOCUMENT_TYPES.map((option) => {
            const isSelected = option.key === selectedKey;
            return (
              <Pressable
                key={option.key}
                className="flex-row items-center justify-between rounded-2xl px-1 py-3"
                onPress={() => onSelect(option.key)}
              >
                <Text className="text-sm text-slate-900">{option.label}</Text>
                {isSelected ? (
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}
