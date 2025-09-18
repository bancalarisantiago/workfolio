## ACCESSIBILITY & QA

- Ensure all screens are usable with VoiceOver (iOS) and TalkBack (Android); verify focus order and meaningful announcements.
- Provide descriptive `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` props on interactive elements.
- Maintain color contrast ratios ≥ 4.5:1 for text, using the design token palette; document exceptions with design approval.
- Support dynamic text sizing and test with large accessibility fonts to prevent layout clipping.
- Include haptic feedback via `expo-haptics` for critical actions (success, error, warnings) when appropriate.
- Add `testID` attributes for elements used in automated QA or Detox flows.
- Maintain a smoke-test checklist per platform covering authentication, navigation, data refresh, offline/online transitions, and error states.

### ✅ Accessibility Pass Steps

1. Enable VoiceOver/TalkBack and navigate the screen end-to-end.
2. Verify focus lands on the first actionable element and returns to logical locations after modals/toasts close.
3. Check color contrast using tooling (e.g., Stark, React Native Accessibility Inspector).
4. Test with dynamic font settings and device dark mode.
5. Confirm haptics and sounds respect system accessibility preferences.

> 💡 Record findings in the PR description or QA ticket; include screenshots or screen recordings illustrating the accessibility verification.
