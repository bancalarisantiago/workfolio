import type { ComponentProps } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';

type GluestackComponents = typeof import('@gluestack-ui/themed');
type GluestackInputProps = ComponentProps<GluestackComponents['Input']>;
type GluestackInputFieldProps = ComponentProps<GluestackComponents['InputField']>;

export type ControllerInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  helperText?: string;
  inputProps?: GluestackInputProps;
} & Omit<GluestackInputFieldProps, 'value' | 'onBlur' | 'onChangeText'>;
