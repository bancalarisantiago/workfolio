import { Stack } from 'expo-router';

export default function PaychecksStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Paychecks' }}
      />
    </Stack>
  );
}
