import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
  Icon,
  Input,
  InputField,
  InputSlot,
  Pressable,
} from '@gluestack-ui/themed';
import { useEffect, useState } from 'react';
import { Controller, type FieldValues } from 'react-hook-form';

import type { ControllerInputProps } from './types';

export function ControllerInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  inputProps,
  secureTextEntry,
  ...fieldProps
}: ControllerInputProps<TFieldValues>) {
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

        return (
          <FormControl isInvalid={Boolean(error)}>
            {label ? (
              <FormControlLabel>
                <FormControlLabelText>{label}</FormControlLabelText>
              </FormControlLabel>
            ) : null}

            <Input
              {...inputProps}
              isInvalid={Boolean(error)}
            >
              <InputField
                {...fieldProps}
                secureTextEntry={isSecure}
                value={stringValue}
                onBlur={onBlur}
                onChangeText={onChange}
              />

              {secureTextEntry ? (
                <InputSlot pr="$3">
                  <Pressable
                    accessibilityLabel={!isSecure ? 'Show password' : 'Hide password'}
                    accessibilityRole="button"
                    onPress={() => setIsSecure((prev) => !prev)}
                  >
                    <Icon as={!isSecure ? EyeIcon : EyeOffIcon} />
                  </Pressable>
                </InputSlot>
              ) : null}
            </Input>

            {helperText && !error ? (
              <FormControlHelper>
                <FormControlHelperText>{helperText}</FormControlHelperText>
              </FormControlHelper>
            ) : null}

            {error ? (
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error.message}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </FormControl>
        );
      }}
    />
  );
}
