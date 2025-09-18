## ANALYTICS & LOGGING

- Centralize analytics through a single client (e.g., Segment, Amplitude) and wrap it with a typed helper in `/lib`.
- Use consistent event naming: `feature_action_outcome` (e.g., `profile_edit_success`). Document new events in the analytics schema.
- Include contextual metadata (screen, user role, experiment cohort) while omitting PII unless explicitly approved.
- Buffer or debounce high-frequency events to avoid flooding the pipeline and impacting performance.
- For logging, use a structured logger (e.g., `expo-logger` or custom console wrapper) that tags environment, severity, and component.
- Route critical errors to monitoring (Sentry) and mirror user-facing toast/dialog messaging for faster support triage.
- Gate debug logging behind `__DEV__` flags and remove verbose statements before release branches cut.

### ✅ Examples

```ts
// analytics helper (lib/analytics.ts)
export const track = (event: AnalyticsEvent, props?: AnalyticsProps) => {
  analytics().track(event, {
    appVersion,
    platform,
    ...props,
  });
};

track('profile_edit_success', { method: 'form', hasAvatar: true });
```

```ts
// structured logging
log.info('profile:load', { userId, durationMs });
log.error('profile:update_failed', { error: message, stack });
```

```ts
// guard verbose logs
if (__DEV__) {
  log.debug('profile:form_state', { values });
}
```

> 💡 Keep analytics specs in sync with product and data teams. For every new event, capture instrumentation status and QA evidence before release.
