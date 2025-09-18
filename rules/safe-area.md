## SAFE AREA

- Use `SafeAreaProvider` from `react-native-safe-area-context` to wrap your app at the root level.
- Use `SafeAreaView` for screens to respect notches, status bars, and platform-specific insets.
- Use `SafeAreaScrollView` for scrollable screens to ensure full content visibility.
- Avoid hardcoding top/bottom padding or margins; instead, rely on `insets` from context or safe area views.

### ✅ Examples

```tsx
// Root layout (App.tsx or _layout.tsx)
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  )
}
```

```tsx
// In a screen
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>My Profile</Text>
    </SafeAreaView>
  )
}