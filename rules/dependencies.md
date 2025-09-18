## DEPENDENCIES

- Favor Expo-compatible libraries and verify that packages support the Managed Workflow before adding them.
- Discuss new dependencies with the team; document the motivation, bundle-size impact, and maintenance plan in the PR description.
- Prefer first-party Expo SDK modules, React Native Community packages, or well-supported OSS (>1k stars, recent activity) to reduce risk.
- Use `yarn add` for runtime dependencies and `yarn add -D` for tooling; avoid mixing `npm` or `pnpm` to keep the lockfile consistent.
- Run `yarn why <package>` to audit transitive installs when investigating duplication or size regressions.
- Remove unused packages promptly and clean up any related Metro/Babel config.
- Track security advisories with `yarn npm audit --recursive` before releases; patch vulnerable packages or document mitigations.

### ✅ Examples

```bash
# Add a vetted Expo-compatible library
yarn add expo-image-picker

# Add a dev tool only for linting/build steps
yarn add -D @types/react-native

# Inspect why a package appears twice
yarn why @react-native-async-storage/async-storage
```

> 💡 When a dependency needs native code and is not supported in Expo Managed Workflow, evaluate if the feature can ship via a web service or deferred until we eject intentionally.
