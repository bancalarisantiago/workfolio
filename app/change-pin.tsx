import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';

export default function ChangePinScreen() {
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const handleSave = () => {
    if (pin.length !== 4 || confirmation.length !== 4) {
      Alert.alert('PIN inválido', 'El PIN debe tener 4 dígitos.');
      return;
    }

    if (pin !== confirmation) {
      Alert.alert('PIN diferente', 'Ambos campos deben coincidir.');
      return;
    }

    Alert.alert('PIN actualizado', 'Tu nuevo PIN fue guardado.');
    setPin('');
    setConfirmation('');
  };

  return (
    <View className="flex-1 gap-8 bg-white px-6 py-10 dark:bg-zinc-950">
      <View className="gap-2">
        <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Cambiar PIN
        </Text>
        <Text className="text-base text-slate-500 dark:text-slate-400">
          Definí un nuevo código de 4 dígitos para asegurar tu cuenta.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Nuevo PIN</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            className="rounded-xl border border-slate-200 px-4 py-3 text-lg tracking-widest text-slate-900 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-50"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirmar PIN
          </Text>
          <TextInput
            value={confirmation}
            onChangeText={setConfirmation}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            className="rounded-xl border border-slate-200 px-4 py-3 text-lg tracking-widest text-slate-900 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-50"
          />
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        className={cn(
          'items-center justify-center rounded-xl bg-sky-600 px-5 py-3',
          !(pin.length === 4 && confirmation.length === 4) && 'opacity-60',
        )}
        disabled={!(pin.length === 4 && confirmation.length === 4)}
      >
        <Text className="text-base font-semibold text-white">Guardar PIN</Text>
      </Pressable>
    </View>
  );
}
