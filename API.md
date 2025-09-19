# Backend Planning – Workfolio

## Goal & Scope
- Deliver a multi-tenant Supabase backend supporting SaaS onboarding for companies, admins, and employees.
- Enable HR admins to manage company documentation, calendar events, paychecks, and employee records.
- Provide groundwork for push/email notifications and future web dashboard consumption.

## Supabase Architecture Highlights
- **Auth**: Supabase Auth `users` table for all accounts; admins flagged via role metadata.
- **Tenant isolation**: Each company owns a unique `company_code` entered during signup. All domain tables include `company_id` with RLS enforcing tenant scoping.
- **Storage**: Supabase Storage buckets for documentation uploads and paychecks (separate buckets to isolate retention policies).
- **Edge Functions**: Used for notifications (push/email), scheduled jobs (e.g., holiday sync, birthday reminders), and secure workflows (document signing webhooks if needed).
- **Database**: Postgres schema `public` with hydrated views for the dashboard; `rls` policies applied per table.

## Core Entities & Tables

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `companies` | Master record for each tenant. | `id`, `name`, `company_code` (unique), `country_code`, `plan_tier`, `created_by`
| `company_members` | Join table linking Supabase user to a company/role. | `id`, `company_id`, `user_id`, `role` (`admin`/`employee`), `status`, `invited_at`, `joined_at`
| `user_profiles` | Extends Supabase Auth with profile info. | `user_id`, `full_name`, `phone`, `avatar_url`, `time_zone`, `locale`
| `employee_profiles` | Employee-specific HR fields (one per member with role `employee`). | `id`, `company_id`, `member_id`, `employee_number`, `birthday`, `hire_date`, `termination_date`, `is_active`, `pin_hash`, `pin_failed_attempts`, `pin_locked_until`, `pin_last_reset_at`
| `document_categories` | Admin-defined document groupings. | `id`, `company_id`, `name`, `description`, `is_active`
| `document_templates` | Optional templates admins configure (name, description, required?). | `id`, `company_id`, `category_id`, `title`, `description`, `requires_signature`, `is_published`
| `documents` | Instances of documents assigned to employees. | `id`, `company_id`, `template_id`, `employee_id`, `title`, `status` (`pending`, `signed`, `rejected`, `expired`), `due_at`, `signed_at`, `signed_by`
| `document_files` | Storage linkage for document uploads (employee uploads or template source files). | `id`, `company_id`, `document_id`, `file_path`, `uploaded_by`, `uploaded_at`, `version`
| `paychecks` | Paycheck metadata + file reference. | `id`, `company_id`, `employee_id`, `period_start`, `period_end`, `gross_amount`, `net_amount`, `currency`, `file_path`, `issued_at`, `status` (`unsigned`, `signed`), `viewed_at`, `downloaded_at`, `signed_at`, `signed_by`
| `paycheck_signature_events` | Detailed audit of PIN/biometric signing steps. | `id`, `company_id`, `paycheck_id`, `employee_id`, `event_type` (`pin_entered`, `biometric_success`, `biometric_failure`), `metadata`, `created_at`
| `events` | Calendar events across company scope. | `id`, `company_id`, `type` (`company`, `birthday`, `holiday`, `hr_event`), `title`, `description`, `start_at`, `end_at`, `is_all_day`, `created_by`, `source` (`manual`, `generated`, `imported`)
| `event_attendees` | Explicit attendee targeting when not company-wide. | `id`, `event_id`, `employee_id`, `response_status`, `notified_at`
| `holiday_calendars` | Cached list of holidays per country/company for override. | `id`, `company_id`, `country_code`, `name`, `date`, `source`
| `notification_channels` | Tracks device tokens/emails per user. | `id`, `user_id`, `type` (`push`, `email`), `target`, `is_verified`, `last_seen_at`
| `notifications` | Queue of notifications triggered in the system. | `id`, `company_id`, `category`, `title`, `payload`, `priority`, `created_at`
| `notification_deliveries` | Delivery log per channel. | `id`, `notification_id`, `channel_id`, `status`, `sent_at`, `fail_reason`
| `audit_logs` | Record admin actions for compliance. | `id`, `company_id`, `actor_id`, `action`, `metadata`, `created_at`

## Auth & Onboarding Flows
- **Company creation**: Admin signs up, submits company info, backend generates unique `company_code`, creates `companies` row, and seeds `company_members` with role `admin`.
- **Employee invite**:
  1. Admin adds employee via email/phone, optionally generates invite link/code.
  2. Employee signup screen requests `company_code`; Supabase function validates and links to `company_members` row.
  3. Upon activation, create `employee_profiles` record and assign default document templates (optional automation).
- **Security setup**: Prompt employees to establish a 4–6 digit PIN (stored hashed) and register device biometrics; enforce re-auth if either factor changes.
- **RLS enforcement**: Policies filter by `company_id` using `auth.uid()` via joins into `company_members`.

## Documentation Management
- **Lifecycle**: `draft` (template setup) → `issued` (document row created) → `pending` (await signature/upload) → `signed`/`rejected`/`expired`.
- **Signatures**: Track `signed_at`/`signed_by`; allow optional `signed_url` if using e-sign flow later.
- **Uploads**: Employee or admin uploads stored in `documents` bucket with path pattern `company/{company_id}/documents/{document_id}/{version}`.
- **Categories/Templates**: Admin-defined taxonomy enables per-company organization; default templates can be seeded via SQL script and toggled per tenant.

## Paychecks
- Stored in dedicated `paychecks` bucket with per-company folder structure.
- Access via signed URLs; enforce RLS so only employee + admins can see metadata/URL.
- Support optional metadata (amounts) now; extend with tax forms later.
- Track lifecycle fields to surface status in dashboards: `status` (`unsigned` vs `signed`), `viewed_at`, `downloaded_at` timestamps.
- PIN is a numeric secret stored server-side as a salted hash in `employee_profiles.pin_hash`; change/reset flows will require identity verification.
- Signing flow requires PIN entry and biometric confirmation from the device; record `signed_at`/`signed_by` once both checks pass.
- Persist each step (PIN entry success, biometric success/failure) in `paycheck_signature_events` for compliance and forensic review.
- Block signature attempts when no valid PIN is set; enforce a server-side limit of five failed PIN tries before locking the account until manual reset/timeout.
- Expose a secure in-app menu flow for PIN resets that verifies identity (e.g., re-auth + admin confirmation) and updates `pin_last_reset_at`.
- Store device identifier inside `paycheck_signature_events.metadata` for biometric events to trace which handset confirmed the signature.

## Calendar & Events
- **Types**:
  - `company`: All-hands, meetings, training.
  - `birthday`: Auto-generated yearly from `employee_profiles.birthday`.
  - `holiday`: Seeded from `holiday_calendars` based on company country; admins can override/disable.
  - `hr_event`: HR-created events like tech talks.
- **Attendees**: `events` default to company-wide; `event_attendees` restricts to selected employees/teams in future.
- **Notifications**: Edge Function cron broadcasts reminders (e.g., 24h before).
- **Integrations**: Future ICS export or external calendar sync noted as stretch goal.

## Notifications Strategy
- Store Expo push tokens and preferred emails in `notification_channels`.
- `notifications` table captures event source (document reminder, paycheck published, event upcoming).
- Edge Function consumes new `notifications` rows to fan out via push/email (e.g., Resend/SendGrid for email).
- Maintain delivery logs (`notification_deliveries`) for audit and retries.
- Allow per-user preferences table later (`notification_preferences`).

## Roles & Permissions
- Roles enumeration: `admin`, `employee` (extendable: `manager`, `viewer`).
- `company_members.role` drives access; RLS ensures employees can only view their own sensitive records (documents, paychecks) while admins can see company-wide.
- Admin capabilities: manage employees, documents, events, notifications, paychecks.
- Employee capabilities: view/update own profile, acknowledge documents, view assigned documents/paychecks/events, manage notification channels.

## API Surface (Initial Draft)
Supabase auto-generated REST + RPC endpoints. Key RPC ideas:
- `rpc_create_company(payload)` – wraps company creation, ensures unique code, seeds admin membership.
- `rpc_invite_employee(payload)` – inserts member placeholder, triggers invite email.
- `rpc_issue_document(document_id)` – sets status `pending`, queues notification.
- `rpc_publish_paycheck(payload)` – uploads file, creates record, enqueues notifications.
- `rpc_schedule_event(payload)` – inserts event, optional attendee targeting, schedules reminders.
- `rpc_mark_notification_read(notification_id)` – allow clients to mark as read.

We’ll document client usage in future sections (mobile vs dashboard) once flows are finalized.

## RLS Policy Concepts
- `companies`: allow CRUD only to admins; read limited via membership.
- `company_members`: users can see their row; admins can manage all rows within company.
- `employee_profiles`: employees read/update own; admins full access.
- `documents` & `document_files`: employees see documents assigned to them; admins see all.
- `paychecks`: employees see their own; admins see all.
- `events`: members see events belonging to their company; `event_attendees` restricts if specified.
- `notifications`: scoped by company; `notification_deliveries` limited to owning user.
- Use policy helper views to simplify policy expressions (e.g., `current_company_members` view).

## Future Considerations
- **Billing/Plans**: Add `subscriptions` table tied to Stripe for SaaS tiers.
- **Team/Department hierarchy**: Additional table (`teams`) to group employees for targeted events/docs.
- **Document signing integration**: Evaluate Supabase + third-party e-sign (e.g., HelloSign) via webhooks.
- **Analytics**: Event tracking tables to audit feature usage.
- **Data retention**: Scheduled purge/archive routines for documents/paychecks.
- **Dashboard**: Build read-optimized views (e.g., `company_overview_view`) for analytics cards.

## Next Steps
1. Validate onboarding + invite UX w/ product team (fields, flows, email templates).
2. Decide on default document templates and holiday data source.
3. Draft RLS policies and sample SQL migrations for tables above.
4. Prototype notification Edge Function with Expo push and email provider.
5. Sync with design for admin dashboard requirements before modeling extras (teams, analytics).
