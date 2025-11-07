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
  Paycheck,
  PaycheckInsert,
  PaycheckReplace,
  PaycheckSignatureEvent,
  PaycheckSignatureEventInsert,
  PaycheckSignatureEventReplace,
  PaycheckSignatureEventUpdate,
  PaycheckUpdate,
} from '@/types/db';

export const getPaychecks = async (companyId: string): Promise<Paycheck[]> => {
  const response = await supabase
    .from<Paycheck>('paychecks')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('issued_at', { ascending: false });

  return unwrapList(response, 'Unable to load paychecks');
};

export const getPaychecksForEmployee = async (
  companyId: string,
  employeeId: string,
): Promise<Paycheck[]> => {
  const response = await supabase
    .from<Paycheck>('paychecks')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('employee_id', ensureIdentifier(employeeId, 'employeeId'))
    .order('issued_at', { ascending: false });

  return unwrapList(response, 'Unable to load paychecks for employee');
};

export const getPaycheckById = async (
  companyId: string,
  paycheckId: string,
): Promise<Paycheck> => {
  const response = await supabase
    .from<Paycheck>('paychecks')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(paycheckId, 'paycheckId'))
    .maybeSingle();

  const paycheck = unwrapMaybeSingle(response, 'Unable to load paycheck');

  if (!paycheck) {
    throw new RepositoryError('Paycheck not found', { status: 404 });
  }

  return paycheck;
};

export const createPaycheck = async (
  companyId: string,
  payload: PaycheckInsert,
): Promise<Paycheck> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<Paycheck>('paychecks')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create paycheck');
};

export const replacePaycheck = async (
  companyId: string,
  paycheckId: string,
  payload: PaycheckReplace,
): Promise<Paycheck> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<Paycheck>('paychecks')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(paycheckId, 'paycheckId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace paycheck');
};

export const updatePaycheck = async (
  companyId: string,
  paycheckId: string,
  payload: PaycheckUpdate,
): Promise<Paycheck> => {
  const response = await supabase
    .from<Paycheck>('paychecks')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(paycheckId, 'paycheckId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update paycheck');
};

export const deletePaycheck = async (
  companyId: string,
  paycheckId: string,
): Promise<void> => {
  const response = await supabase
    .from('paychecks')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(paycheckId, 'paycheckId'));

  ensureNoError(response, 'Unable to delete paycheck');
};

export const getPaycheckSignatureEvents = async (
  companyId: string,
  paycheckId: string,
): Promise<PaycheckSignatureEvent[]> => {
  const response = await supabase
    .from<PaycheckSignatureEvent>('paycheck_signature_events')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('paycheck_id', ensureIdentifier(paycheckId, 'paycheckId'))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load paycheck signature events');
};

export const getPaycheckSignatureEventById = async (
  companyId: string,
  eventId: string,
): Promise<PaycheckSignatureEvent> => {
  const response = await supabase
    .from<PaycheckSignatureEvent>('paycheck_signature_events')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .maybeSingle();

  const event = unwrapMaybeSingle(response, 'Unable to load paycheck signature event');

  if (!event) {
    throw new RepositoryError('Paycheck signature event not found', { status: 404 });
  }

  return event;
};

export const createPaycheckSignatureEvent = async (
  companyId: string,
  payload: PaycheckSignatureEventInsert,
): Promise<PaycheckSignatureEvent> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<PaycheckSignatureEvent>('paycheck_signature_events')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create paycheck signature event');
};

export const replacePaycheckSignatureEvent = async (
  companyId: string,
  eventId: string,
  payload: PaycheckSignatureEventReplace,
): Promise<PaycheckSignatureEvent> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<PaycheckSignatureEvent>('paycheck_signature_events')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace paycheck signature event');
};

export const updatePaycheckSignatureEvent = async (
  companyId: string,
  eventId: string,
  payload: PaycheckSignatureEventUpdate,
): Promise<PaycheckSignatureEvent> => {
  const response = await supabase
    .from<PaycheckSignatureEvent>('paycheck_signature_events')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update paycheck signature event');
};

export const deletePaycheckSignatureEvent = async (
  companyId: string,
  eventId: string,
): Promise<void> => {
  const response = await supabase
    .from('paycheck_signature_events')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'));

  ensureNoError(response, 'Unable to delete paycheck signature event');
};
