import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const connectionString =
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DB_CONNECTION_STRING ??
  process.env.EXPO_PUBLIC_SUPABASE_URL_DB ??
  process.env.EXPO_PUBLIC_SUPABASE_URL_SQL ??
  process.env.DATABASE_URL ??
  null;

if (!connectionString) {
  console.error(
    'Missing database connection string. Set SUPABASE_DB_URL (or EXPO_PUBLIC_SUPABASE_URL_DB) using the Supabase Settings → Database → Connection string.',
  );
  process.exit(1);
}

const statements = [
  `create extension if not exists "pgcrypto";`,
  `create table if not exists public.companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    legal_name text,
    company_code text not null unique,
    country_code text not null,
    default_time_zone text not null default 'UTC',
    plan_tier text not null default 'trial',
    plan_renewal_at timestamptz,
    billing_email text,
    industry text,
    employee_count_estimate integer,
    logo_url text,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    constraint companies_plan_tier_check check (plan_tier in ('trial','starter','growth','enterprise'))
  );`,
  `create index if not exists idx_companies_plan_tier on public.companies(plan_tier);`,
  `create index if not exists idx_companies_country on public.companies(country_code);`,
  `create table if not exists public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    preferred_name text,
    avatar_url text,
    phone text,
    time_zone text not null default 'UTC',
    locale text not null default 'en',
    bio text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,
  `create index if not exists idx_user_profiles_locale on public.user_profiles(locale);`,
  `create index if not exists idx_user_profiles_time_zone on public.user_profiles(time_zone);`,
  `create table if not exists public.company_members (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null,
    status text not null default 'invited',
    invited_at timestamptz not null default now(),
    joined_at timestamptz,
    suspended_at timestamptz,
    invited_by uuid references auth.users(id),
    note text,
    created_at timestamptz not null default now(),
    constraint company_members_role_check check (role in ('admin','employee')),
    constraint company_members_status_check check (status in ('invited','active','suspended','left')),
    constraint company_members_unique unique (company_id, user_id)
  );`,
  `create index if not exists idx_company_members_company_role on public.company_members(company_id, role);`,
  `create index if not exists idx_company_members_status on public.company_members(company_id, status);`,
  `create table if not exists public.employee_profiles (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    member_id uuid not null references public.company_members(id) on delete cascade,
    employee_number text,
    job_title text,
    department text,
    manager_member_id uuid references public.company_members(id) on delete set null,
    birthday date,
    hire_date date,
    termination_date date,
    is_active boolean not null default true,
    pin_hash text,
    pin_failed_attempts smallint not null default 0,
    pin_locked_until timestamptz,
    pin_last_reset_at timestamptz,
    emergency_contact jsonb,
    address jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint employee_profiles_unique_number unique (company_id, employee_number)
  );`,
  `create index if not exists idx_employee_profiles_company_manager on public.employee_profiles(company_id, manager_member_id);`,
  `create index if not exists idx_employee_profiles_active on public.employee_profiles(company_id, is_active);`,
  `create table if not exists public.user_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    company_id uuid references public.companies(id) on delete set null,
    theme text not null default 'system',
    language text not null default 'en',
    timezone_override text,
    receive_company_announcements boolean not null default true,
    receive_payroll_notifications boolean not null default true,
    receive_document_prompts boolean not null default true,
    biometric_auth_enabled boolean not null default false,
    pin_required_for_sensitive boolean not null default true,
    marketing_opt_in boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users(id),
    constraint user_preferences_theme_check check (theme in ('system','light','dark'))
  );`,
  `create index if not exists idx_user_preferences_company on public.user_preferences(company_id);`,
  `create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    actor_id uuid references auth.users(id),
    action text not null,
    severity text not null default 'info',
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint audit_logs_severity_check check (severity in ('info','warning','critical'))
  );`,
  `create index if not exists idx_audit_logs_company_time on public.audit_logs(company_id, created_at desc);`,
  `create table if not exists public.document_categories (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    name text not null,
    description text,
    is_active boolean not null default true,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint document_categories_unique_name unique (company_id, name)
  );`,
  `create index if not exists idx_document_categories_active on public.document_categories(company_id, is_active);`,
  `create table if not exists public.document_templates (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    category_id uuid references public.document_categories(id) on delete set null,
    title text not null,
    description text,
    requires_signature boolean not null default true,
    is_published boolean not null default false,
    valid_from date,
    valid_until date,
    default_due_days integer,
    version integer not null default 1,
    last_published_at timestamptz,
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,
  `create index if not exists idx_document_templates_company_status on public.document_templates(company_id, is_published);`,
  `create index if not exists idx_document_templates_category on public.document_templates(category_id);`,
  `create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    template_id uuid references public.document_templates(id),
    employee_id uuid not null references public.employee_profiles(id) on delete cascade,
    title text not null,
    status text not null default 'pending',
    issued_at timestamptz not null default now(),
    due_at timestamptz,
    signed_at timestamptz,
    signed_by uuid references auth.users(id),
    rejected_at timestamptz,
    rejected_reason text,
    expired_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_by uuid references auth.users(id),
    updated_at timestamptz not null default now(),
    constraint documents_status_check check (status in ('pending','signed','rejected','expired'))
  );`,
  `create index if not exists idx_documents_employee_status on public.documents(employee_id, status);`,
  `create index if not exists idx_documents_company_due on public.documents(company_id, due_at);`,
  `create table if not exists public.document_files (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    document_id uuid references public.documents(id) on delete cascade,
    template_id uuid references public.document_templates(id) on delete cascade,
    file_path text not null,
    file_size integer,
    content_type text,
    version integer not null default 1,
    uploaded_by uuid references auth.users(id),
    uploaded_at timestamptz not null default now(),
    checksum text
  );`,
  `create index if not exists idx_document_files_document_version on public.document_files(document_id, version desc);`,
  `create index if not exists idx_document_files_template on public.document_files(template_id);`,
  `create table if not exists public.notification_channels (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references public.companies(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null,
    target text not null,
    is_verified boolean not null default false,
    verification_code text,
    verification_expires_at timestamptz,
    last_seen_at timestamptz,
    device_info jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint notification_channels_type_check check (type in ('push','email')),
    constraint notification_channels_unique_target unique (type, target)
  );`,
  `create index if not exists idx_notification_channels_user_type on public.notification_channels(user_id, type);`,
  `create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references public.companies(id) on delete cascade,
    category text not null,
    title text not null,
    body text,
    payload jsonb not null default '{}'::jsonb,
    priority text not null default 'normal',
    target_scope text not null default 'user',
    target_user_id uuid references auth.users(id) on delete cascade,
    target_employee_id uuid references public.employee_profiles(id) on delete cascade,
    source_reference text,
    scheduled_at timestamptz,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    constraint notifications_priority_check check (priority in ('low','normal','high')),
    constraint notifications_scope_check check (target_scope in ('user','company','custom'))
  );`,
  `create index if not exists idx_notifications_company_created on public.notifications(company_id, created_at desc);`,
  `create index if not exists idx_notifications_target_user on public.notifications(target_user_id) where target_scope = 'user';`,
  `create table if not exists public.notification_deliveries (
    id uuid primary key default gen_random_uuid(),
    notification_id uuid not null references public.notifications(id) on delete cascade,
    channel_id uuid not null references public.notification_channels(id) on delete cascade,
    status text not null default 'pending',
    sent_at timestamptz,
    read_at timestamptz,
    fail_reason text,
    retry_count integer not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint notification_deliveries_status_check check (status in ('pending','sent','failed','read'))
  );`,
  `create index if not exists idx_notification_deliveries_notification on public.notification_deliveries(notification_id);`,
  `create index if not exists idx_notification_deliveries_failed on public.notification_deliveries(status) where status = 'failed';`,
  `create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    type text not null,
    title text not null,
    description text,
    start_at timestamptz not null,
    end_at timestamptz,
    is_all_day boolean not null default false,
    source text not null default 'manual',
    location text,
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    cancelled_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    constraint events_type_check check (type in ('company','birthday','holiday','hr_event')),
    constraint events_source_check check (source in ('manual','generated','imported'))
  );`,
  `create index if not exists idx_events_company_start on public.events(company_id, start_at);`,
  `create index if not exists idx_events_type on public.events(company_id, type);`,
  `create table if not exists public.event_attendees (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    employee_id uuid not null references public.employee_profiles(id) on delete cascade,
    response_status text not null default 'pending',
    notified_at timestamptz,
    response_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    constraint event_attendees_status_check check (response_status in ('pending','accepted','declined')),
    constraint event_attendees_unique unique (event_id, employee_id)
  );`,
  `create index if not exists idx_event_attendees_employee on public.event_attendees(employee_id);`,
  `create table if not exists public.holiday_calendars (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    country_code text not null,
    name text not null,
    date date not null,
    source text not null,
    is_observed boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`,
  `create index if not exists idx_holiday_calendars_company_date on public.holiday_calendars(company_id, date);`,
  `create index if not exists idx_holiday_calendars_country on public.holiday_calendars(country_code, date);`,
];

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    for (const statement of statements) {
      const preview = statement.split('\n')[0].slice(0, 80);
      console.log(`\n➡️  ${preview}...`);
      try {
        await client.query(statement);
      } catch (error) {
        console.error('❌ Error executing statement:', error.message ?? error);
        if (error.position) {
          console.error('Position:', error.position);
        }
        throw error;
      }
    }

    console.log('\n✅ Schema creation statements executed successfully.');
  } catch (error) {
    console.error('Schema setup failed.', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
