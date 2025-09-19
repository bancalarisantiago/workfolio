import { AntDesign } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';

import { ControllerInput } from '@/components/custom/ControllerInput';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });
  const { signIn, isAuthLoading } = useAuth();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#e2e8f0' : '#1e293b';
  const isBusy = formState.isSubmitting || isAuthLoading;

  const onSubmit = async (values: LoginFormValues) => {
    await signIn(values);
  };

  const handleGoogleSignIn = async () => {
    await signIn({ email: 'google-user@example.com', password: 'oauth-placeholder' });
  };

  return (
    <View className="flex-1 justify-center gap-8 px-6 py-10">
      <View className="gap-2">
        <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
          Welcome back
        </Text>
        <Text className="text-base text-slate-500 dark:text-slate-400">Sign in to continue</Text>
      </View>

      <View className="gap-4">
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
          textContentType="password"
        />
      </View>

      <Link
        href="/recover"
        className="self-end"
      >
        <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
          Forgot password?
        </Text>
      </Link>

      <View className="gap-3">
        <Pressable
          className={cn(
            'items-center justify-center rounded-xl bg-sky-600 px-5 py-3',
            isBusy && 'opacity-60',
          )}
          disabled={isBusy}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-base font-semibold text-white">Sign In</Text>
        </Pressable>

        <Pressable
          className={cn(
            'flex-row items-center justify-center rounded-xl border border-slate-200 px-5 py-3 dark:border-slate-700',
            isBusy && 'opacity-60',
          )}
          disabled={isBusy}
          onPress={handleGoogleSignIn}
        >
          <AntDesign
            name="google"
            size={18}
            color={iconColor}
          />
          <Text className="ml-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            Continue with Google
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?
        </Text>
        <Link href="/signup">
          <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
