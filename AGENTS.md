# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Expo Router routes. Place new screens under route groups (e.g., `(tabs)/feature.tsx`) and co-locate data loaders when possible.
- `components/` collects shared UI primitives in PascalCase files; keep feature-specific components near the routes that use them.
- `hooks/` contains reusable data/state hooks (prefix `use`), while `constants/` holds app-wide config. Static assets (images, fonts) live in `assets/`.
- Platform config and typings reside in `app.json`, `expo-env.d.ts`, and `tsconfig.json`. Use `scripts/reset-project.js` when bundler caches misbehave.

## Build, Test, and Development Commands
- `yarn start` (or `npx expo start`) spins up Metro and auto-detects platforms.
- `yarn android`, `yarn ios`, `yarn web` open the app in those targets; ensure emulators/simulators are running.
- `yarn lint` runs ESLint with the Expo + Prettier profile; fix or suppress findings before pushing.
- `yarn lint:fix` applies auto-fixes from ESLint and Prettier in one pass.
- `yarn format` rewrites files with Prettier defaults; use `yarn format:check` in CI or pre-push hooks.
- `yarn reset-project` clears Expo caches and reinstalls node modules when builds act inconsistently.

## Coding Style & Naming Conventions
- Stick with TypeScript, functional React components, and 2-space indentation. Keep props/interfaces typed explicitly and prefer a `Props` suffix.
- Name components in PascalCase (`ProfileCard.tsx`), hooks in camelCase with a `use` prefix, and route files following Expo Router patterns (`app/(tabs)/settings.tsx`).
- Let ESLint + Prettier dictate spacing, quoting, and trailing commas; avoid mixing default and named exports within the same module.

## Testing Guidelines
- Automated tests are not yet configured. When adding them, follow React Native Testing Library patterns in `__tests__` folders mirroring `app/`.
- For now, validate features via `yarn start` on each platform you touch and capture videos or screenshots for UI changes.

## Commit & Pull Request Guidelines
- Write commit subjects in the imperative mood (“Add profile tabs”), ideally under 72 characters; include scoped prefixes (`feat`, `fix`) when it clarifies intent.
- Keep PRs focused, reference related issues, and document platform coverage plus screenshots for visual updates.
- Ensure lint and format checks pass, and include manual test notes in every PR description.

## Rules Reference
- [Accessibility & QA](rules/accessibility-qa.md): Validate screens with VoiceOver/TalkBack, maintain contrast, support dynamic type, wire haptics, and log smoke-test coverage per platform.
- [Analytics & Logging](rules/analytics-logging.md): Centralize telemetry with typed helpers, enforce consistent event schemas, strip PII, and tie severity-tagged logs to monitoring.
- [Code Style](rules/code-style.md): Favor concise, functional TypeScript with descriptive naming, modular helpers, and Expo-aligned workflows over classes or duplicated logic.
- [Dependencies](rules/dependencies.md): Vet packages for Expo compatibility, document rationale, keep Yarn authoritative, and audit transitive installs and advisories.
- [Deployment](rules/deployment.md): Ship via Expo managed workflow, rely on Expo OTA tooling, and validate builds across platforms with production-ready configs.
- [Error Handling](rules/error-handling.md): Validate inputs with Zod, wire forms through React Hook Form, track issues via Sentry, and wrap layouts in global error boundaries.
- [Language](rules/language.md): Localize with Expo localization tools, honor RTL layouts, and ensure text scales accessibly with reliable fallbacks.
- [Naming Conventions](rules/naming-conventions.md): Keep folders kebab-case, prefer named exports, and use auxiliary verbs (`is`/`has`/`can`/`should`) for boolean clarity.
- [Navigation](rules/navigation.md): Implement Expo Router patterns, expose intuitive deep links, and lean on official docs for tabs, stacks, and dynamic routes.
- [Performance](rules/performance.md): Minimize redundant state, memoize expensive work, lazy-load secondary screens, and optimize media and splash handling.
- [Release Hygiene](rules/release-hygiene.md): Follow semantic versioning, update changelogs, track EAS build IDs/channels, and stage OTA rollouts with post-release monitoring.
- [Safe Area](rules/safe-area.md): Wrap layouts with `SafeAreaProvider`/`SafeAreaView` components and rely on provided insets instead of manual padding.
- [Security](rules/security.md): Sanitize inputs, enforce HTTPS, store secrets in encrypted storage, and follow Expo security best practices.
- [State Management](rules/state-management.md): Prefer `useReducer` plus context for shared state, adopt React Query for server data, and scale with Zustand or Redux Toolkit when needed.
- [Styling & UI](rules/styling-ui.md): Use Gluestack UI, Tailwind/NativeWind utilities, responsive hooks, and accessible theming with reanimated interactions.
- [Syntax & Formatting](rules/syntax-formatting.md): Use `function` declarations for pure logic, favor terse conditional returns, declarative JSX, and keep Prettier conventions.
- [Testing](rules/testing.md): Cover features with Jest + RNTL unit/snapshot tests, layer Detox E2E flows, and use Expo’s testing guides for device coverage.
- [TypeScript](rules/typescript.md): Enforce strict TypeScript with interface-first typing, avoid enums and `any`, and colocate component-specific types alongside implementations.
