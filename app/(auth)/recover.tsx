import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { ControllerInput } from '@/components/custom/ControllerInput';
import { GradientBackground } from '@/components/custom/GradientBackground';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';

const recoverySchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export default function RecoverScreen() {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { control, handleSubmit, reset, formState } = useForm<RecoveryFormValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(recoverySchema),
    mode: 'onChange',
  });
  const { requestPasswordReset, isAuthLoading } = useAuth();
  const isBusy = formState.isSubmitting || isAuthLoading;

  const onSubmit = async (values: RecoveryFormValues) => {
    await requestPasswordReset(values);
    setIsRequestSent(true);
    reset(values);
  };

  return (
    <GradientBackground>
      <View className="flex-1 justify-center gap-8 bg-white/85 px-6 py-10 dark:bg-zinc-950/85">
        <View className="gap-2">
          <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
            Recover access
          </Text>
          <Text className="text-base text-slate-500 dark:text-slate-400">
            We will email you instructions to reset your password.
          </Text>
        </View>

        <ControllerInput
          control={control}
          name="email"
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable
          className={cn(
            'items-center justify-center rounded-xl bg-primary-600 px-5 py-3',
            isBusy && 'opacity-60',
          )}
          disabled={isBusy}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-base font-semibold text-white">Send recovery email</Text>
        </Pressable>

        {isRequestSent ? (
          <Text className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Recovery instructions sent to your inbox.
          </Text>
        ) : null}

        <Link
          href="/login"
          className="mt-4"
        >
          <Text className="text-center text-sm font-semibold text-primary-600 dark:text-primary-300">
            Back to sign in
          </Text>
        </Link>
      </View>
    </GradientBackground>
  );
}
