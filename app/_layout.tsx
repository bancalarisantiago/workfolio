import { Center, GluestackUIProvider, Spinner } from '@gluestack-ui/themed';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import '../global.css';

import gluestackConfig from '@/gluestack-ui.config';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { isAuthLoading } = useAuth();
  const colorScheme = useColorScheme();

  if (isAuthLoading) {
    return (
      <Center
        flex={1}
        bg={colorScheme === 'dark' ? '$backgroundDark950' : '$backgroundLight0'}
      >
        <Spinner size="large" />
      </Center>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GluestackUIProvider
            config={gluestackConfig}
            colorMode={colorScheme === 'dark' ? 'dark' : 'light'}
          >
            <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
              <AuthGate />
            </SafeAreaView>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </GluestackUIProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
