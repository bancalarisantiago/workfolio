# Workfolio API Documentation

This directory consolidates backend planning artifacts for the Supabase stack. Start with the high-level goals in `../API.md`, then dive into schema-specific guides stored in dedicated folders here.

## Structure
- `schemas/` – folder with one subdirectory per domain schema.
  - `company/COMPANY.md` – tenant master data, plan tiers, and audit governance.
  - `user/USER.md` – user identity, membership, security, and preferences.
  - `documents/DOCUMENTS.md` – document categories, templates, issues, and file versions.
  - `notifications/NOTIFICATIONS.md` – delivery channels, notification queue, and delivery logs.
  - `events/EVENTS.md` – calendar events, attendees, and holiday cache.

## Schema Connectivity
```mermaid
erDiagram
    COMPANIES ||--o{ COMPANY_MEMBERS : "company_id"
    AUTH_USERS ||--o{ COMPANY_MEMBERS : "user_id"
    AUTH_USERS ||--|| USER_PROFILES : "user_id"
    COMPANY_MEMBERS ||--|| EMPLOYEE_PROFILES : "member_id"
    AUTH_USERS ||--|| USER_PREFERENCES : "user_id"

    COMPANIES ||--o{ DOCUMENT_CATEGORIES : "company_id"
    DOCUMENT_CATEGORIES ||--o{ DOCUMENT_TEMPLATES : "category_id"
    DOCUMENT_TEMPLATES ||--o{ DOCUMENTS : "template_id"
    EMPLOYEE_PROFILES ||--o{ DOCUMENTS : "employee_id"
    DOCUMENTS ||--o{ DOCUMENT_FILES : "document_id"

    COMPANIES ||--o{ EVENTS : "company_id"
    EVENTS ||--o{ EVENT_ATTENDEES : "event_id"
    COMPANIES ||--o{ HOLIDAY_CALENDARS : "company_id"

    AUTH_USERS ||--o{ NOTIFICATION_CHANNELS : "user_id"
    COMPANIES ||--o{ NOTIFICATIONS : "company_id"
    NOTIFICATIONS ||--o{ NOTIFICATION_DELIVERIES : "notification_id"
    NOTIFICATION_CHANNELS ||--o{ NOTIFICATION_DELIVERIES : "channel_id"

    COMPANIES ||--o{ AUDIT_LOGS : "company_id"
    AUTH_USERS ||--o{ AUDIT_LOGS : "actor_id"
```

## Contributing
1. Create a folder under `schemas/` matching the domain name (kebab-case). Inside, add a `<SCHEMA>.md` file (uppercase, e.g., `PAYROLL.md`) with table definitions, relationships, RLS guidance, lifecycle notes, and a Mermaid diagram.
2. Link back to relevant rules in `rules/` (e.g., `code-style`, `security`, `analytics-logging`) so policies stay front of mind.
3. Keep doc updates in sync with Supabase migrations to avoid drift.
4. Apply schema changes using `yarn db:setup` (set `SUPABASE_DB_URL`, `EXPO_PUBLIC_SUPABASE_URL_DB`, or `EXPO_PUBLIC_SUPABASE_URL_SQL` with the Database connection string from Supabase Settings → Database) so documentation and database stay aligned.

> Tip: Use `yarn lint` before submitting PRs to ensure markdown linting conventions remain consistent.
