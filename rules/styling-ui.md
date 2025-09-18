## STYLING UI

- Use Gluestack UI components instead of React Native primitives like `View` and `Text` to ensure better theme support.
- Use Tailwind and NativeWind for utility-based styling in React Native.
- Use Gluestack UI components and design tokens when building accessible and themeable UIs.
- Use `useWindowDimensions` or Tailwind responsive utilities (`sm:`, `md:`) for responsive layout.
- Use `useColorScheme` to support dark mode.
- Ensure accessibility with ARIA roles and native accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessible`).
- Use `react-native-reanimated` for smooth, performant animations.
- Use `react-native-gesture-handler` for advanced gestures.
- Always import `View`, `Text`, and other base components from `@gluestack-ui/themed` instead of `react-native` to ensure consistent theming support.

### ✅ Examples

```tsx
// Tailwind with NativeWind
<Text className="text-lg font-semibold text-primary" />
```

```ts
// Responsive check with useWindowDimensions
const { width } = useWindowDimensions()
const isTablet = width >= 768
```

```ts
// Dynamic theme
const colorScheme = useColorScheme()
const background = colorScheme === 'dark' ? '#000' : '#fff'
```

```tsx
// Gluestack example (with @gluestack-ui/themed)
<Center>
  <Button variant="solid">
    <ButtonText>Continue</ButtonText>
  </Button>
</Center>
```

```tsx
// Accessibility
<Pressable
  accessible
  accessibilityLabel="Submit form"
  accessibilityRole="button"
>
  <Text>Submit</Text>
</Pressable>
```

```tsx
// Reanimated
<Animated.View entering={FadeIn}>
  <Text>Animated</Text>
</Animated.View>
```
