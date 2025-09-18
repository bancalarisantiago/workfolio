## PERFORMANCE

- Minimize the use of `useState` and `useEffect` when not necessary. Avoid state overuse for derived or static values.
- Use `useReducer` and `React Context` for shared state and more predictable logic handling.
- Lazy load non-critical components using dynamic imports or `React.lazy()` to reduce initial bundle size.
- Memoize components and expensive computations with `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders.
- Optimize images:
  - Use WebP format where supported.
  - Use `expo-image` for performant image rendering.
  - Include width and height explicitly to avoid layout shifts.
  - Implement lazy loading for offscreen images.
- Use `Expo AppLoading` and `SplashScreen` to provide a smoother app startup experience and preload necessary assets.

### ✅ Examples

```tsx
// Lazy load a screen
const LazyScreen = React.lazy(() => import('./screens/LazyScreen'));

// Memoized callback
const handleSubmit = useCallback(() => {
  // ...logic
}, [formData]);

// useReducer instead of multiple useState calls
const [state, dispatch] = useReducer(reducer, initialState);

// Optimized image (expo-image)
import { Image } from 'expo-image';
<Image
  source={{ uri: 'https://example.com/image.webp' }}
  contentFit="cover"
  style={{ width: 300, height: 200 }}
/>;

// SplashScreen handling
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();
// then hide after assets are loaded
```

> 💡 Profile your app regularly using Expo DevTools, `why-did-you-render`, and React Native performance profiling tools.
