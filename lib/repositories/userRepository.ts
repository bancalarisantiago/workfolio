import { supabase } from '@/lib/supabase';
import {
  ensureMutation,
  ensureNoError,
  RepositoryError,
  unwrapList,
  unwrapMaybeSingle,
} from '@/lib/adapters/supabaseAdapter';
import { ensureCompanyScope, ensureIdentifier } from '@/lib/middlewares/ensureCompanyScope';
import type {
  EmployeeProfile,
  EmployeeProfileInsert,
  EmployeeProfileReplace,
  EmployeeProfileUpdate,
  UserPreference,
  UserPreferenceInsert,
  UserPreferenceReplace,
  UserPreferenceUpdate,
  UserProfile,
  UserProfileInsert,
  UserProfileReplace,
  UserProfileUpdate,
} from '@/types/db';

export const getUserProfiles = async (): Promise<UserProfile[]> => {
  const response = await supabase
    .from<UserProfile>('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load user profiles');
};

export const getUserProfileById = async (userId: string): Promise<UserProfile> => {
  const response = await supabase
    .from<UserProfile>('user_profiles')
    .select('*')
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .maybeSingle();

  const profile = unwrapMaybeSingle(response, 'Unable to load user profile');

  if (!profile) {
    throw new RepositoryError('User profile not found', { status: 404 });
  }

  return profile;
};

export const createUserProfile = async (
  payload: UserProfileInsert,
): Promise<UserProfile> => {
  const response = await supabase
    .from<UserProfile>('user_profiles')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create user profile');
};

export const replaceUserProfile = async (
  userId: string,
  payload: UserProfileReplace,
): Promise<UserProfile> => {
  const response = await supabase
    .from<UserProfile>('user_profiles')
    .update(payload)
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace user profile');
};

export const updateUserProfile = async (
  userId: string,
  payload: UserProfileUpdate,
): Promise<UserProfile> => {
  const response = await supabase
    .from<UserProfile>('user_profiles')
    .update(payload)
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update user profile');
};

export const deleteUserProfile = async (userId: string): Promise<void> => {
  const response = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', ensureIdentifier(userId, 'userId'));

  ensureNoError(response, 'Unable to delete user profile');
};

export const getEmployeeProfiles = async (
  companyId: string,
): Promise<EmployeeProfile[]> => {
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load employee profiles');
};

export const getEmployeeProfileById = async (
  companyId: string,
  employeeId: string,
): Promise<EmployeeProfile> => {
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(employeeId, 'employeeId'))
    .maybeSingle();

  const employee = unwrapMaybeSingle(response, 'Unable to load employee profile');

  if (!employee) {
    throw new RepositoryError('Employee profile not found', { status: 404 });
  }

  return employee;
};

export const getEmployeeProfileByMemberId = async (
  memberId: string,
): Promise<EmployeeProfile | null> => {
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .select('*')
    .eq('member_id', ensureIdentifier(memberId, 'memberId'))
    .maybeSingle();

  return unwrapMaybeSingle(response, 'Unable to load employee profile');
};

export const ensureEmployeeProfileForMember = async (
  companyId: string,
  memberId: string,
): Promise<EmployeeProfile> => {
  const existing = await getEmployeeProfileByMemberId(memberId);
  if (existing) {
    return existing;
  }

  const payload: EmployeeProfileInsert = {
    company_id: ensureCompanyScope(companyId),
    member_id: ensureIdentifier(memberId, 'memberId'),
    employee_number: null,
    job_title: null,
    department: null,
    manager_member_id: null,
    birthday: null,
    hire_date: null,
    termination_date: null,
    is_active: true,
    pin_hash: null,
    pin_failed_attempts: 0,
    pin_locked_until: null,
    pin_last_reset_at: null,
    emergency_contact: null,
    address: null,
  };

  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to provision employee profile');
};

export const createEmployeeProfile = async (
  companyId: string,
  payload: EmployeeProfileInsert,
): Promise<EmployeeProfile> => {
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .insert({ ...payload, company_id: ensureCompanyScope(companyId) })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create employee profile');
};

export const replaceEmployeeProfile = async (
  companyId: string,
  employeeId: string,
  payload: EmployeeProfileReplace,
): Promise<EmployeeProfile> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(employeeId, 'employeeId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace employee profile');
};

export const updateEmployeeProfile = async (
  companyId: string,
  employeeId: string,
  payload: EmployeeProfileUpdate,
): Promise<EmployeeProfile> => {
  const response = await supabase
    .from<EmployeeProfile>('employee_profiles')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(employeeId, 'employeeId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update employee profile');
};

export const deleteEmployeeProfile = async (
  companyId: string,
  employeeId: string,
): Promise<void> => {
  const response = await supabase
    .from('employee_profiles')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(employeeId, 'employeeId'));

  ensureNoError(response, 'Unable to delete employee profile');
};

export const getUserPreferences = async (
  userId: string,
): Promise<UserPreference | null> => {
  const response = await supabase
    .from<UserPreference>('user_preferences')
    .select('*')
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .maybeSingle();

  return unwrapMaybeSingle(response, 'Unable to load user preferences');
};

export const createUserPreferences = async (
  payload: UserPreferenceInsert,
): Promise<UserPreference> => {
  const response = await supabase
    .from<UserPreference>('user_preferences')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create user preferences');
};

export const replaceUserPreferences = async (
  userId: string,
  payload: UserPreferenceReplace,
): Promise<UserPreference> => {
  const response = await supabase
    .from<UserPreference>('user_preferences')
    .update(payload)
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace user preferences');
};

export const updateUserPreferences = async (
  userId: string,
  payload: UserPreferenceUpdate,
): Promise<UserPreference> => {
  const response = await supabase
    .from<UserPreference>('user_preferences')
    .update(payload)
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update user preferences');
};

export const deleteUserPreferences = async (userId: string): Promise<void> => {
  const response = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', ensureIdentifier(userId, 'userId'));

  ensureNoError(response, 'Unable to delete user preferences');
};
