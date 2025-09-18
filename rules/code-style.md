## CODE STYLE

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Keep functions focused and purposeful.
- Prefer iteration and modularization over code duplication. Break down large logic into small, testable functions. Use `.map`, `.reduce`, `.filter` instead of manually writing loops.
- Use descriptive variable names with auxiliary verbs.
- Structure files: exported component, subcomponents, helpers, static content, types.
- Prefer managed workflow unless ejecting is intentional.
- Write the minimal code necessary to express intent clearly.
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

### ✅ Examples

```ts
// ✅ Good
const getUserFullName = (user: { firstName: string; lastName: string }) =>
  `${user.firstName} ${user.lastName}`;

// ❌ Bad (too verbose)
function getUserFullName(user: { firstName: string; lastName: string }) {
  const fullName = user.firstName + ' ' + user.lastName;
  return fullName;
}
```

```tsx
// ✅ Functional
function ProfileCard({ name }: { name: string }) {
  return <Text>Hello, {name}</Text>;
}

// ❌ Class-based
class ProfileCard extends React.Component<{ name: string }> {
  render() {
    return <Text>Hello, {this.props.name}</Text>;
  }
}
```

```ts
// ✅ Modular and expressive
const formatPrices = (items: Item[]) => items.map((item) => formatPrice(item.price));

// ❌ Duplicated logic
const prices = items.map((item) => {
  const formatted = item.price.toFixed(2);
  return `$${formatted}`;
});
```

```ts
// ✅ Descriptive variable names
const isSubmitting = useAppSelector((state) => state.form.isSubmitting);
const hasPermission = user.roles.includes('admin');
```
