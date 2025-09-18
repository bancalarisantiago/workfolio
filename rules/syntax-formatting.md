## SYNTAX FORMATTING

- Use the `function` keyword for pure functions.
- Avoid unnecessary curly braces in conditionals.
- Use declarative JSX.
- Use Prettier for consistent formatting.

### ✅ Examples

```ts
// ✅ Good
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

// ❌ Avoid
const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};
```

```ts
// ✅ Good
if (!user) return null;

// ❌ Bad
if (!user) {
  return null;
}
```

```tsx
// ✅ Good
{
  isLoading ? <ActivityIndicator /> : <UserProfile />;
}

// ❌ Bad
{
  (() => {
    if (isLoading) return <ActivityIndicator />;
    return <UserProfile />;
  })();
}
```

### ✅ Recommended Prettier config

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```
