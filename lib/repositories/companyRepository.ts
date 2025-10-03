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
  AuditLog,
  AuditLogInsert,
  AuditLogReplace,
  AuditLogUpdate,
  Company,
  CompanyInsert,
  CompanyMember,
  CompanyMemberInsert,
  CompanyMemberReplace,
  CompanyMemberUpdate,
  CompanyReplace,
  CompanyUpdate,
} from '@/types/db';

export const getAllCompanies = async (): Promise<Company[]> => {
  const response = await supabase
    .from<Company>('companies')
    .select('*')
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load companies');
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await supabase
    .from<Company>('companies')
    .select('*')
    .eq('id', ensureIdentifier(id, 'companyId'))
    .maybeSingle();

  const company = unwrapMaybeSingle(response, 'Unable to load company');

  if (!company) {
    throw new RepositoryError('Company not found', { status: 404 });
  }

  return company;
};

export const createCompany = async (payload: CompanyInsert): Promise<Company> => {
  const response = await supabase
    .from<Company>('companies')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create company');
};

export const replaceCompany = async (
  id: string,
  payload: CompanyReplace,
): Promise<Company> => {
  const response = await supabase
    .from<Company>('companies')
    .update(payload)
    .eq('id', ensureIdentifier(id, 'companyId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace company');
};

export const updateCompany = async (
  id: string,
  payload: CompanyUpdate,
): Promise<Company> => {
  const response = await supabase
    .from<Company>('companies')
    .update(payload)
    .eq('id', ensureIdentifier(id, 'companyId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update company');
};

export const deleteCompany = async (id: string): Promise<void> => {
  const response = await supabase
    .from('companies')
    .delete()
    .eq('id', ensureIdentifier(id, 'companyId'));

  ensureNoError(response, 'Unable to delete company');
};

export const getCompanyMembers = async (
  companyId: string,
): Promise<CompanyMember[]> => {
  const response = await supabase
    .from<CompanyMember>('company_members')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load company members');
};

export const getCompanyMemberById = async (
  companyId: string,
  memberId: string,
): Promise<CompanyMember> => {
  const response = await supabase
    .from<CompanyMember>('company_members')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(memberId, 'memberId'))
    .maybeSingle();

  const member = unwrapMaybeSingle(response, 'Unable to load company member');

  if (!member) {
    throw new RepositoryError('Company member not found', { status: 404 });
  }

  return member;
};

export const createCompanyMember = async (
  companyId: string,
  payload: CompanyMemberInsert,
): Promise<CompanyMember> => {
  const response = await supabase
    .from<CompanyMember>('company_members')
    .insert({ ...payload, company_id: ensureCompanyScope(companyId) })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create company member');
};

export const replaceCompanyMember = async (
  companyId: string,
  memberId: string,
  payload: CompanyMemberReplace,
): Promise<CompanyMember> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<CompanyMember>('company_members')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('id', ensureIdentifier(memberId, 'memberId'))
    .eq('company_id', scopedCompanyId)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace company member');
};

export const updateCompanyMember = async (
  companyId: string,
  memberId: string,
  payload: CompanyMemberUpdate,
): Promise<CompanyMember> => {
  const response = await supabase
    .from<CompanyMember>('company_members')
    .update(payload)
    .eq('id', ensureIdentifier(memberId, 'memberId'))
    .eq('company_id', ensureCompanyScope(companyId))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update company member');
};

export const deleteCompanyMember = async (
  companyId: string,
  memberId: string,
): Promise<void> => {
  const response = await supabase
    .from('company_members')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(memberId, 'memberId'));

  ensureNoError(response, 'Unable to delete company member');
};

export const getAuditLogs = async (companyId: string): Promise<AuditLog[]> => {
  const response = await supabase
    .from<AuditLog>('audit_logs')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: false });

  return unwrapList(response, 'Unable to load audit logs');
};

export const getAuditLogById = async (
  companyId: string,
  logId: string,
): Promise<AuditLog> => {
  const response = await supabase
    .from<AuditLog>('audit_logs')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(logId, 'logId'))
    .maybeSingle();

  const log = unwrapMaybeSingle(response, 'Unable to load audit log');

  if (!log) {
    throw new RepositoryError('Audit log entry not found', { status: 404 });
  }

  return log;
};

export const createAuditLog = async (
  companyId: string,
  payload: AuditLogInsert,
): Promise<AuditLog> => {
  const response = await supabase
    .from<AuditLog>('audit_logs')
    .insert({ ...payload, company_id: ensureCompanyScope(companyId) })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create audit log entry');
};

export const replaceAuditLog = async (
  companyId: string,
  logId: string,
  payload: AuditLogReplace,
): Promise<AuditLog> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<AuditLog>('audit_logs')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('id', ensureIdentifier(logId, 'logId'))
    .eq('company_id', scopedCompanyId)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace audit log entry');
};

export const updateAuditLog = async (
  companyId: string,
  logId: string,
  payload: AuditLogUpdate,
): Promise<AuditLog> => {
  const response = await supabase
    .from<AuditLog>('audit_logs')
    .update(payload)
    .eq('id', ensureIdentifier(logId, 'logId'))
    .eq('company_id', ensureCompanyScope(companyId))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update audit log entry');
};

export const deleteAuditLog = async (companyId: string, logId: string): Promise<void> => {
  const response = await supabase
    .from('audit_logs')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(logId, 'logId'));

  ensureNoError(response, 'Unable to delete audit log entry');
};
