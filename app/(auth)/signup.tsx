import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { ControllerInput } from '@/components/custom/ControllerInput';
import { GradientBackground } from '@/components/custom/GradientBackground';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';
import type { SignUpFormValues } from '@/types/screens/auth';

const optionalTrimmedField = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : undefined;
  });

const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
    companyCode: z
      .string()
      .optional()
      .transform((value) => {
        const trimmed = value?.trim() ?? '';
        return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
      }),
    companyName: optionalTrimmedField,
    countryCode: optionalTrimmedField,
    defaultTimeZone: optionalTrimmedField,
    industry: optionalTrimmedField,
    billingEmail: optionalTrimmedField,
    companyDescription: optionalTrimmedField,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
  .superRefine((values, ctx) => {
    const wantsToJoinExisting = Boolean(values.companyCode);
    const hasCreationFields = Boolean(
      values.companyName && values.countryCode && values.defaultTimeZone,
    );

    if (!wantsToJoinExisting && !hasCreationFields) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyCode'],
        message: 'Ingresá el código de tu empresa o completa los datos para crear una nueva.',
      });
    }
  });

export default function SignUpScreen() {
  const { control, handleSubmit, formState, watch } = useForm<SignUpFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyCode: '',
      companyName: '',
      countryCode: '',
      defaultTimeZone: '',
      industry: '',
      billingEmail: '',
      companyDescription: '',
    },
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });
  const { register, isAuthLoading } = useAuth();
  const isBusy = formState.isSubmitting || isAuthLoading;
  const companyCodeValue = watch('companyCode');
  const isJoiningExisting = Boolean((companyCodeValue ?? '').trim());

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const { emailConfirmationRequired } = await register(values);

      if (emailConfirmationRequired) {
        Alert.alert(
          'Revisa tu correo',
          'Te enviamos un enlace para confirmar tu cuenta antes de iniciar sesión.',
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos crear tu cuenta.';
      Alert.alert('Error al registrarse', message);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-8 bg-white/85 px-6 py-10 dark:bg-zinc-950/85">
            <View className="gap-2">
              <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
                Create account
              </Text>
              <Text className="text-base text-slate-500 dark:text-slate-400">
                Start managing your workfolio
              </Text>
            </View>

            <View className="gap-4">
              <ControllerInput
                control={control}
                name="fullName"
                label="Full name"
                autoCapitalize="words"
              />
              <ControllerInput
                control={control}
                name="email"
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <ControllerInput
                control={control}
                name="password"
                label="Password"
                secureTextEntry
                textContentType="newPassword"
              />
              <ControllerInput
                control={control}
                name="confirmPassword"
                label="Confirm password"
                secureTextEntry
                textContentType="newPassword"
              />
              <ControllerInput
                control={control}
                name="companyCode"
                label="Company code"
                autoCapitalize="characters"
                helperText="Ingresá el código que recibiste. Si lo dejás vacío y completás los datos de tu empresa, generaremos uno automáticamente."
              />
              <ControllerInput
                control={control}
                name="companyName"
                label="Company name"
                autoCapitalize="words"
                helperText="Obligatorio solo si creás una nueva empresa desde cero."
                inputProps={{ isDisabled: isJoiningExisting }}
              />
              <ControllerInput
                control={control}
                name="countryCode"
                label="Country (ISO 3166-1)"
                autoCapitalize="characters"
                helperText="Ejemplo: AR, US, ES. Obligatorio para crear una nueva empresa."
                inputProps={{ isDisabled: isJoiningExisting }}
              />
              <ControllerInput
                control={control}
                name="defaultTimeZone"
                label="Default time zone"
                autoCapitalize="none"
                helperText="Ejemplo: America/Argentina/Buenos_Aires. Obligatorio para crear una nueva empresa."
                inputProps={{ isDisabled: isJoiningExisting }}
              />
              <ControllerInput
                control={control}
                name="industry"
                label="Industry"
                autoCapitalize="words"
                inputProps={{ isDisabled: isJoiningExisting }}
              />
              <ControllerInput
                control={control}
                name="billingEmail"
                label="Billing email"
                keyboardType="email-address"
                autoCapitalize="none"
                inputProps={{ isDisabled: isJoiningExisting }}
              />
              <ControllerInput
                control={control}
                name="companyDescription"
                label="Company description"
                inputProps={{
                  isDisabled: isJoiningExisting,
                  multiline: true,
                  numberOfLines: 3,
                  placeholder: 'Breve descripción',
                }}
              />
            </View>

            <Pressable
              className={cn(
                'items-center justify-center rounded-xl bg-primary-600 px-5 py-3',
                isBusy && 'opacity-60',
              )}
              disabled={isBusy}
              onPress={handleSubmit(onSubmit)}
            >
              <Text className="text-base font-semibold text-white">Sign Up</Text>
            </Pressable>

            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?
              </Text>
              <Link href="/login">
                <Text className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                  Sign in
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
