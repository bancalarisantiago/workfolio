import { Stack } from 'expo-router';

export default function DocumentsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Documents' }}
      />
    </Stack>
  );
}
