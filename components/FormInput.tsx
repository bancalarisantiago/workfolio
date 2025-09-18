import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import {
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextInputProps,
} from 'react-native';

import { cn } from '@/lib/cn';

type FormInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  helperText?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'>;

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  ...textInputProps
}: FormInputProps<TFieldValues>) {
  const colorScheme = useColorScheme();
  const placeholderColor =
    textInputProps.placeholderTextColor ?? (colorScheme === 'dark' ? '#94a3b8' : '#94a3b8');
  const { style: inputStyle, secureTextEntry, ...restInputProps } = textInputProps;
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));

  useEffect(() => {
    setIsSecure(Boolean(secureTextEntry));
  }, [secureTextEntry]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const stringValue = value === undefined || value === null ? '' : String(value);
        const isInvalid = Boolean(error);

        return (
          <View className="gap-2">
            {label ? (
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
              </Text>
            ) : null}

            <View className="relative">
              <TextInput
                {...restInputProps}
                className={cn(
                  'h-12 rounded-xl border bg-white px-4 py-0 pr-12 text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-slate-100',
                  isInvalid
                    ? 'border-rose-500 focus:border-rose-500 dark:border-rose-400 dark:focus:border-rose-300'
                    : 'border-slate-200 focus:border-sky-500 dark:border-slate-700 dark:focus:border-sky-400',
                )}
                onBlur={onBlur}
                onChangeText={onChange}
                value={stringValue}
                placeholderTextColor={placeholderColor}
                secureTextEntry={isSecure}
                selectionColor={colorScheme === 'dark' ? '#38bdf8' : '#0ea5e9'}
                aria-invalid={isInvalid}
                style={[{ textAlignVertical: 'center', paddingVertical: 0 }, inputStyle]}
              />

              {secureTextEntry ? (
                <Pressable
                  accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
                  accessibilityRole="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  hitSlop={12}
                  onPress={() => setIsSecure((prev) => !prev)}
                >
                  <Feather
                    name={!isSecure ? 'eye' : 'eye-off'}
                    size={20}
                    color={colorScheme === 'dark' ? '#e2e8f0' : '#475569'}
                  />
                </Pressable>
              ) : null}
            </View>

            {helperText && !error ? (
              <Text className="text-sm text-slate-500 dark:text-slate-400">{helperText}</Text>
            ) : null}

            {error ? (
              <Text className="text-sm text-rose-600 dark:text-rose-400">{error.message}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
