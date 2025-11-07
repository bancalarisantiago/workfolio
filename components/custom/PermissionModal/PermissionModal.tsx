import { Modal, Pressable, Text, View } from 'react-native';

type PermissionModalProps = {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function PermissionModal({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Permitir',
  cancelLabel = 'Cancelar',
}: PermissionModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-center bg-slate-900/60 px-6">
        <View className="w-full rounded-3xl bg-white p-6">
          <Text className="text-lg font-semibold text-slate-900">{title}</Text>
          <Text className="mt-2 text-sm text-slate-500">{description}</Text>

          <View className="mt-6 flex-row justify-end gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              className="rounded-full border border-slate-200 px-4 py-2"
            >
              <Text className="text-sm font-semibold text-slate-600">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              className="rounded-full bg-primary-600 px-4 py-2"
            >
              <Text className="text-sm font-semibold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
