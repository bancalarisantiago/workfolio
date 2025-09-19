import { Stack } from 'expo-router';

export default function DocumentsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="upload"
        options={{
          title: 'Enviar documento',
          headerTintColor: '#ffffff',
          headerStyle: {
            backgroundColor: '#0C6DD9',
          },
          headerBackTitleVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
