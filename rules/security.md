## SECURITY

- Always sanitize and validate user input to prevent XSS and injection attacks.
- Use [`react-native-encrypted-storage`](https://github.com/emeraldsanto/react-native-encrypted-storage) for securely storing sensitive data like tokens or credentials.
- Ensure all API communication uses HTTPS and implements proper authentication (e.g., tokens, OAuth).
- Follow Expo’s official [Security Guide](https://docs.expo.dev/guides/security/) for app hardening and safe practices.

### ✅ Examples

```ts
// Sanitize input
import DOMPurify from 'dompurify'

const safeInput = DOMPurify.sanitize(userInput)
```

```ts
// Secure storage example
import EncryptedStorage from 'react-native-encrypted-storage'

await EncryptedStorage.setItem('auth_token', 'your-token')

const token = await EncryptedStorage.getItem('auth_token')
```

```ts
// Enforce HTTPS in fetch requests
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

```ts
// Enable app security configurations
// expo-dev-client supports production-only secure options
// see: https://docs.expo.dev/guides/security/#best-practices

// Example settings in app.json
{
  "expo": {
    "android": {
      "package": "com.example.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "https",
            "host": "*.example.com",
            "pathPrefix": "/"
          },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

> 💡 Avoid storing sensitive information in `AsyncStorage` or plain text. Always use encrypted storage and secure transport.
