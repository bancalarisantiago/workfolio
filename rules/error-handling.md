## ERROR HANDLING

- Use [Zod](https://zod.dev/) for runtime validation of API responses, forms, and user input.
- Integrate Zod with [React Hook Form](https://react-hook-form.com/) for efficient form validation in React Native.
- Use [Sentry](https://sentry.io/) or a similar tool for real-time error monitoring and logging.
- Favor early returns and avoid deeply nested or unnecessary `else` blocks to improve readability.
- Implement global error boundaries in React Native to catch rendering errors and prevent app crashes.
- Use `expo-error-reporter` for integrating error tracking in Expo projects.

### ✅ Examples

```ts
// ✅ Zod validation
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

const response = await fetch('/api/user');
const data = await response.json();
const user = UserSchema.parse(data);
```

```tsx
// ✅ Zod with React Hook Form in a functional component
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View, TextInput, Button, Text } from 'react-native';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Email"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Password"
            secureTextEntry
          />
        )}
      />
      <Button
        title="Submit"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
```

```ts
// ✅ Early return
if (!user) return null;

// ❌ Bad: unnecessary nesting
if (user) {
  // ...
} else {
  return null;
}
```

```tsx
// ✅ Global error boundary using expo-error-reporter
import { ErrorBoundary } from 'expo-error-reporter';

export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <RootLayout />
    </ErrorBoundary>
  );
}
```
