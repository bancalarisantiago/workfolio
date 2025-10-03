export type PlanTier = 'trial' | 'starter' | 'growth' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  legal_name: string | null;
  company_code: string;
  country_code: string;
  default_time_zone: string;
  plan_tier: PlanTier;
  plan_renewal_at: string | null;
  billing_email: string | null;
  industry: string | null;
  employee_count_estimate: number | null;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  metadata: Record<string, unknown> | null;
}

export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CompanyReplace = CompanyInsert;

export type CompanyUpdate = Partial<CompanyInsert>;

export type MemberRole = 'admin' | 'employee';

export type MemberStatus = 'invited' | 'active' | 'suspended' | 'left';

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  invited_at: string;
  joined_at: string | null;
  suspended_at: string | null;
  invited_by: string | null;
  note: string | null;
  created_at: string;
}

export type CompanyMemberInsert = Omit<CompanyMember, 'id' | 'created_at'> & {
  id?: string;
};

export type CompanyMemberReplace = CompanyMemberInsert;

export type CompanyMemberUpdate = Partial<CompanyMemberInsert>;

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
  id: string;
  company_id: string;
  actor_id: string | null;
  action: string;
  severity: AuditSeverity;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'> & {
  id?: string;
};

export type AuditLogReplace = AuditLogInsert;

export type AuditLogUpdate = Partial<AuditLogInsert>;

export interface UserProfile {
  user_id: string;
  full_name: string;
  preferred_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  time_zone: string;
  locale: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at'>;

export type UserProfileReplace = UserProfileInsert;

export type UserProfileUpdate = Partial<UserProfileInsert>;

export interface EmployeeProfile {
  id: string;
  company_id: string;
  member_id: string;
  employee_number: string | null;
  job_title: string | null;
  department: string | null;
  manager_member_id: string | null;
  birthday: string | null;
  hire_date: string | null;
  termination_date: string | null;
  is_active: boolean;
  pin_hash: string | null;
  pin_failed_attempts: number;
  pin_locked_until: string | null;
  pin_last_reset_at: string | null;
  emergency_contact: Record<string, unknown> | null;
  address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type EmployeeProfileInsert = Omit<EmployeeProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type EmployeeProfileReplace = EmployeeProfileInsert;

export type EmployeeProfileUpdate = Partial<EmployeeProfileInsert>;

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserPreference {
  user_id: string;
  company_id: string | null;
  theme: ThemePreference;
  language: string;
  timezone_override: string | null;
  receive_company_announcements: boolean;
  receive_payroll_notifications: boolean;
  receive_document_prompts: boolean;
  biometric_auth_enabled: boolean;
  pin_required_for_sensitive: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type UserPreferenceInsert = Omit<UserPreference, 'created_at' | 'updated_at'>;

export type UserPreferenceReplace = UserPreferenceInsert;

export type UserPreferenceUpdate = Partial<UserPreferenceInsert>;

export interface DocumentCategory {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentCategoryInsert = Omit<DocumentCategory, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type DocumentCategoryReplace = DocumentCategoryInsert;

export type DocumentCategoryUpdate = Partial<DocumentCategoryInsert>;

export interface DocumentTemplate {
  id: string;
  company_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  requires_signature: boolean;
  is_published: boolean;
  valid_from: string | null;
  valid_until: string | null;
  default_due_days: number | null;
  version: number;
  last_published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentTemplateInsert = Omit<DocumentTemplate, 'id' | 'version' | 'created_at' | 'updated_at'> & {
  id?: string;
  version?: number;
};

export type DocumentTemplateReplace = DocumentTemplateInsert;

export type DocumentTemplateUpdate = Partial<DocumentTemplateInsert>;

export type DocumentStatus = 'pending' | 'signed' | 'rejected' | 'expired';

export interface Document {
  id: string;
  company_id: string;
  template_id: string | null;
  employee_id: string;
  title: string;
  status: DocumentStatus;
  issued_at: string;
  due_at: string | null;
  signed_at: string | null;
  signed_by: string | null;
  rejected_at: string | null;
  rejected_reason: string | null;
  expired_at: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  updated_at: string;
}

export type DocumentInsert = Omit<Document, 'id' | 'updated_at'> & {
  id?: string;
};

export type DocumentReplace = DocumentInsert;

export type DocumentUpdate = Partial<DocumentInsert>;

export interface DocumentFile {
  id: string;
  company_id: string;
  document_id: string | null;
  template_id: string | null;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  version: number;
  uploaded_by: string | null;
  uploaded_at: string;
  checksum: string | null;
}

export type DocumentFileInsert = Omit<DocumentFile, 'id' | 'uploaded_at' | 'version'> & {
  id?: string;
  version?: number;
};

export type DocumentFileReplace = DocumentFileInsert;

export type DocumentFileUpdate = Partial<DocumentFileInsert>;

export type EventType = 'company' | 'birthday' | 'holiday' | 'hr_event';

export type EventSource = 'manual' | 'generated' | 'imported';

export interface EventRecord {
  id: string;
  company_id: string;
  type: EventType;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  is_all_day: boolean;
  source: EventSource;
  location: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  metadata: Record<string, unknown> | null;
}

export type EventInsert = Omit<EventRecord, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type EventReplace = EventInsert;

export type EventUpdate = Partial<EventInsert>;

export type AttendanceStatus = 'pending' | 'accepted' | 'declined';

export interface EventAttendee {
  id: string;
  event_id: string;
  employee_id: string;
  response_status: AttendanceStatus;
  notified_at: string | null;
  response_at: string | null;
  metadata: Record<string, unknown> | null;
}

export type EventAttendeeInsert = Omit<EventAttendee, 'id'> & {
  id?: string;
};

export type EventAttendeeReplace = EventAttendeeInsert;

export type EventAttendeeUpdate = Partial<EventAttendeeInsert>;

export interface HolidayCalendar {
  id: string;
  company_id: string;
  country_code: string;
  name: string;
  date: string;
  source: string;
  is_observed: boolean;
  created_at: string;
  updated_at: string;
}

export type HolidayCalendarInsert = Omit<HolidayCalendar, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type HolidayCalendarReplace = HolidayCalendarInsert;

export type HolidayCalendarUpdate = Partial<HolidayCalendarInsert>;

export type NotificationChannelType = 'push' | 'email';

export interface NotificationChannel {
  id: string;
  company_id: string | null;
  user_id: string;
  type: NotificationChannelType;
  target: string;
  is_verified: boolean;
  verification_code: string | null;
  verification_expires_at: string | null;
  last_seen_at: string | null;
  device_info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type NotificationChannelInsert = Omit<NotificationChannel, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type NotificationChannelReplace = NotificationChannelInsert;

export type NotificationChannelUpdate = Partial<NotificationChannelInsert>;

export type NotificationPriority = 'low' | 'normal' | 'high';

export type NotificationScope = 'user' | 'company' | 'custom';

export interface NotificationRecord {
  id: string;
  company_id: string | null;
  category: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  priority: NotificationPriority;
  target_scope: NotificationScope;
  target_user_id: string | null;
  target_employee_id: string | null;
  source_reference: string | null;
  scheduled_at: string | null;
  created_by: string | null;
  created_at: string;
}

export type NotificationInsert = Omit<NotificationRecord, 'id' | 'created_at'> & {
  id?: string;
};

export type NotificationReplace = NotificationInsert;

export type NotificationUpdate = Partial<NotificationInsert>;

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'read';

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  channel_id: string;
  status: DeliveryStatus;
  sent_at: string | null;
  read_at: string | null;
  fail_reason: string | null;
  retry_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type NotificationDeliveryInsert = Omit<NotificationDelivery, 'id' | 'created_at'> & {
  id?: string;
};

export type NotificationDeliveryReplace = NotificationDeliveryInsert;

export type NotificationDeliveryUpdate = Partial<NotificationDeliveryInsert>;

export type PaycheckStatus = 'unsigned' | 'signed';

export interface Paycheck {
  id: string;
  company_id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  net_amount: number;
  currency: string;
  file_path: string | null;
  issued_at: string;
  status: PaycheckStatus;
  viewed_at: string | null;
  downloaded_at: string | null;
  signed_at: string | null;
  signed_by: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
}

export type PaycheckInsert = Omit<Paycheck, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  id?: string;
  status?: PaycheckStatus;
};

export type PaycheckReplace = PaycheckInsert;

export type PaycheckUpdate = Partial<PaycheckInsert>;

export type PaycheckSignatureEventType = 'pin_entered' | 'biometric_success' | 'biometric_failure';

export interface PaycheckSignatureEvent {
  id: string;
  company_id: string;
  paycheck_id: string;
  employee_id: string;
  event_type: PaycheckSignatureEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type PaycheckSignatureEventInsert = Omit<PaycheckSignatureEvent, 'id' | 'created_at'> & {
  id?: string;
};

export type PaycheckSignatureEventReplace = PaycheckSignatureEventInsert;

export type PaycheckSignatureEventUpdate = Partial<PaycheckSignatureEventInsert>;
