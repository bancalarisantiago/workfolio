## DEPLOYMENT

- Use Expo’s **Managed Workflow** to streamline builds, configuration, and OTA updates.
- Optimize for **Mobile Web Vitals**: fast load time, low input delay, and responsive layout shifts.
- Use the following Expo libraries for better deployment and user experience:
  - [`expo-constants`](https://docs.expo.dev/versions/latest/sdk/constants/) for environment-aware configuration
  - [`expo-permissions`](https://docs.expo.dev/versions/latest/sdk/permissions/) to handle runtime permissions
  - [`expo-updates`](https://docs.expo.dev/versions/latest/sdk/updates/) for Over-the-Air updates

- Enable and test **OTA updates** to ship features and bug fixes without going through app store approval.
- Always test thoroughly on **both iOS and Android** devices and simulators before releasing to production.
- Follow Expo's official guide for app publishing and deployment:  
  🔗 https://docs.expo.dev/distribution/introduction/

### ✅ Example: app.json configuration

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "version": "1.0.0",
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0
    },
    "ios": {
      "bundleIdentifier": "com.mycompany.myapp"
    },
    "android": {
      "package": "com.mycompany.myapp"
    }
  }
}
```

> 💡 Use `eas build` for cloud builds and `eas update` for sending OTA updates. Keep environment variables secure and use Expo Secrets for production configs.
