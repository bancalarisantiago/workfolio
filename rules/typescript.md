## TYPESCRIPT

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript.
- Avoid relying on any unless absolutely necessary.
- Use type for unions or function signatures; use interface for objects and components.
- Always define a props interface and use it in the component signature.
- Use the /types folder for global types used across the app (e.g., User, Theme, ApiResponse, etc.).
- Each component folder should have its own types.ts file for local, scoped props and helper types.

### ✅ Examples

```ts
// ✅ Prefer interface for objects
interface User {
  id: string;
  name: string;
}

// ❌ Avoid (unless union, etc.)
type User = {
  id: string;
  name: string;
};

// ✅ Use map instead of enum
const Role = {
  Admin: 'admin',
  User: 'user',
} as const;

type Role = (typeof Role)[keyof typeof Role];

// ❌ Avoid
enum Role {
  Admin = 'admin',
  User = 'user',
}
```

```tsx
// ✅ Typed functional component
interface ButtonProps {
  title: string;
  onPress: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
}
```

```bash
# ✅ Folder structure
components/UserCard/index.tsx
components/UserCard/types.ts

types/global.ts
types/api.ts
types/theme.ts
```
