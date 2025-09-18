## NAVIGATION

- Use [Expo Router](https://expo.github.io/router/docs) for file-based routing and navigation.
- Follow Expo Router's best practices for tabs, stacks, and layouts.
- Support deep linking and dynamic routes for a seamless navigation experience.
- Use Expo's official documentation for setting up and configuring navigation: https://docs.expo.dev/router/introduction/

### ✅ Examples

```tsx
// Navigation with Link from expo-router
import { Link } from 'expo-router'

<Link href="/profile/settings">
  <Text>Go to Settings</Text>
</Link>
```

```tsx
// Navigating programmatically
import { useRouter } from 'expo-router'

const router = useRouter()

router.push('/profile')
router.replace('/login')
```

```ts
// Linking config example
import * as Linking from 'expo-linking'

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      home: 'index',
      profile: 'profile',
      login: 'login',
    },
  },
}
```

> 💡 Keep your routing structure intuitive and flat where possible. Use route groups for organizing authentication or tab layouts.
