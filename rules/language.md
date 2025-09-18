## LANGUAGE (Internationalization & Localization)

- Use [`expo-localization`](https://docs.expo.dev/versions/latest/sdk/localization/) or [`react-native-i18n`](https://github.com/AlexanderZaytsev/react-native-i18n) to handle multiple languages.
- Support **RTL (Right-to-Left)** layouts and bidirectional text.
- Use localization libraries with fallback logic and language detection.
- Ensure that **text scales** correctly by using relative font sizes and accessibility-aware components.
- Test language switches in both development and production builds.

### ✅ Examples

```ts
// Setup with expo-localization + i18n-js
import * as Localization from 'expo-localization'
import i18n from 'i18n-js'

i18n.translations = {
  en: { welcome: 'Welcome' },
  es: { welcome: 'Bienvenido' },
}

i18n.locale = Localization.locale
i18n.fallbacks = true

i18n.t('welcome') // returns translated string
```

```tsx
// Dynamic language switch (example)
<Text>{i18n.t('welcome')}</Text>
```

```ts
// Detect RTL
import { I18nManager } from 'react-native'

if (I18nManager.isRTL) {
  // apply RTL-aware styles
}
```

> 💡 Always use `accessibilityRole="text"` where appropriate and test your font scaling using the device accessibility settings.