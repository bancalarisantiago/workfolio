import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { ControllerInput } from '@/components/custom/ControllerInput';
import { GradientBackground } from '@/components/custom/GradientBackground';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';

const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { control, handleSubmit, formState } = useForm<SignUpFormValues>({
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });
  const { register, isAuthLoading } = useAuth();
  const isBusy = formState.isSubmitting || isAuthLoading;

  const onSubmit = async ({ email, password, fullName }: SignUpFormValues) => {
    await register({ email, password, fullName });
  };

  return (
    <GradientBackground>
      <View className="flex-1 justify-center gap-8 bg-white/85 px-6 py-10 dark:bg-zinc-950/85">
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
    </GradientBackground>
  );
}
