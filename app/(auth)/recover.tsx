import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { FormInput } from '@/components/FormInput';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/use-auth';

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
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <View className="flex-1 justify-center gap-8 px-6 py-10">
        <View className="gap-2">
          <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
            Recover access
          </Text>
          <Text className="text-base text-slate-500 dark:text-slate-400">
            We will email you instructions to reset your password.
          </Text>
        </View>

        <FormInput
          control={control}
          name="email"
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable
          className={cn(
            'items-center justify-center rounded-xl bg-sky-600 px-5 py-3',
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
          <Text className="text-center text-sm font-semibold text-sky-600 dark:text-sky-400">
            Back to sign in
          </Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
