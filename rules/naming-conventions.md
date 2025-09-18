## NAMING CONVENTIONS

- Use kebab-case (lowercase-with-dashes) for all folders and feature directories.
- Favor named exports for components.
- Enables clearer file-level API organization when exporting multiple utilities.
- Each component should be placed in its own folder with an `index.tsx` file.
- Use auxiliary verbs to express boolean intent clearly:
  - `is` → current state (`isLoading`, `isVisible`)
  - `has` → possession (`hasPermission`, `hasError`)
  - `can` → capability (`canEdit`, `canSubmit`)
  - `should` → conditional logic (`shouldRender`, `shouldRetry`)

### ✅ Good

```bash
components/auth-wizard/
screens/user-profile/
lib/form-validation/
```

### ❌ Bad

```bash
Components/AuthWizard/
Screens/UserProfile/
lib/formValidation/
```

```ts
// ✅ Good
export function AuthForm() { ... }
export const LoginButton = () => { ... }

// usage
import { AuthForm, LoginButton } from '@/components/auth-wizard'

// ❌ Bad
export default function AuthForm() { ... }

// usage (less clear during refactor)
import AuthForm from '@/components/auth-wizard'
```

### ✅ Good

```bash
components/UserCard/index.tsx
components/UserCard/styles.ts
components/UserCard/UserCard.test.ts
```
