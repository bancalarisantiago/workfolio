## RELEASE HYGIENE

- Follow semantic versioning: bump patch for fixes, minor for net-new features, and major for breaking changes.
- Update `CHANGELOG.md` (or release notes doc) for every release and include platform coverage plus known issues.
- Tag releases in git (`git tag vX.Y.Z && git push --tags`) after the code merges into the default branch.
- Use `eas build` for signed artifacts and `eas update` for OTA rollouts; document build IDs and channels in the PR or release notes.
- Validate the build on iOS Simulator, Android Emulator, and at least one physical device before promoting to production.
- Stage OTA updates to a dedicated channel, smoke-test, then promote to production once verified.
- Capture crash/error telemetry post-release (24–48h) and be ready to rollback OTA updates if regressions surface.

### ✅ Release Checklist

1. Sync with `main` and ensure `yarn lint` passes.
2. Bump the version in `app.json` and `package.json` (if applicable).
3. Update changelog and confirm screenshots/media assets are current.
4. Run `eas build --platform all` for the target release channel.
5. Install and QA the artifacts on devices, logging results in the release ticket.
6. Publish OTA update (`eas update`) once native builds are validated.
7. Create a release tag and share notes with the team/support.

> 💡 Keep environment variables documented in the release issue and ensure they are configured on Expo/EAS before triggering builds.
