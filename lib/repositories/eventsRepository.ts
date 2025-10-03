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
  EventAttendee,
  EventAttendeeInsert,
  EventAttendeeReplace,
  EventAttendeeUpdate,
  EventInsert,
  EventRecord,
  EventReplace,
  EventUpdate,
  HolidayCalendar,
  HolidayCalendarInsert,
  HolidayCalendarReplace,
  HolidayCalendarUpdate,
} from '@/types/db';

export const getEvents = async (companyId: string): Promise<EventRecord[]> => {
  const response = await supabase
    .from<EventRecord>('events')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('start_at', { ascending: true });

  return unwrapList(response, 'Unable to load events');
};

export const getEventById = async (
  companyId: string,
  eventId: string,
): Promise<EventRecord> => {
  const response = await supabase
    .from<EventRecord>('events')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .maybeSingle();

  const event = unwrapMaybeSingle(response, 'Unable to load event');

  if (!event) {
    throw new RepositoryError('Event not found', { status: 404 });
  }

  return event;
};

export const createEvent = async (
  companyId: string,
  payload: EventInsert,
): Promise<EventRecord> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<EventRecord>('events')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create event');
};

export const replaceEvent = async (
  companyId: string,
  eventId: string,
  payload: EventReplace,
): Promise<EventRecord> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<EventRecord>('events')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace event');
};

export const updateEvent = async (
  companyId: string,
  eventId: string,
  payload: EventUpdate,
): Promise<EventRecord> => {
  const response = await supabase
    .from<EventRecord>('events')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update event');
};

export const deleteEvent = async (
  companyId: string,
  eventId: string,
): Promise<void> => {
  const response = await supabase
    .from('events')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(eventId, 'eventId'));

  ensureNoError(response, 'Unable to delete event');
};

export const getEventAttendees = async (
  companyId: string,
  eventId: string,
): Promise<EventAttendee[]> => {
  const scopedEventId = ensureIdentifier(eventId, 'eventId');
  const response = await supabase
    .from<EventAttendee>('event_attendees')
    .select('*')
    .eq('event_id', scopedEventId)
    .order('id', { ascending: true });

  const attendees = unwrapList(response, 'Unable to load event attendees');

  await getEventById(companyId, scopedEventId);
  return attendees;
};

export const getEventAttendeeById = async (
  eventId: string,
  attendeeId: string,
): Promise<EventAttendee> => {
  const response = await supabase
    .from<EventAttendee>('event_attendees')
    .select('*')
    .eq('event_id', ensureIdentifier(eventId, 'eventId'))
    .eq('id', ensureIdentifier(attendeeId, 'attendeeId'))
    .maybeSingle();

  const attendee = unwrapMaybeSingle(response, 'Unable to load event attendee');

  if (!attendee) {
    throw new RepositoryError('Event attendee not found', { status: 404 });
  }

  return attendee;
};

export const createEventAttendee = async (
  eventId: string,
  payload: EventAttendeeInsert,
): Promise<EventAttendee> => {
  const response = await supabase
    .from<EventAttendee>('event_attendees')
    .insert({ ...payload, event_id: ensureIdentifier(eventId, 'eventId') })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create event attendee');
};

export const replaceEventAttendee = async (
  eventId: string,
  attendeeId: string,
  payload: EventAttendeeReplace,
): Promise<EventAttendee> => {
  const response = await supabase
    .from<EventAttendee>('event_attendees')
    .update({ ...payload, event_id: ensureIdentifier(eventId, 'eventId') })
    .eq('event_id', ensureIdentifier(eventId, 'eventId'))
    .eq('id', ensureIdentifier(attendeeId, 'attendeeId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace event attendee');
};

export const updateEventAttendee = async (
  eventId: string,
  attendeeId: string,
  payload: EventAttendeeUpdate,
): Promise<EventAttendee> => {
  const response = await supabase
    .from<EventAttendee>('event_attendees')
    .update(payload)
    .eq('event_id', ensureIdentifier(eventId, 'eventId'))
    .eq('id', ensureIdentifier(attendeeId, 'attendeeId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update event attendee');
};

export const deleteEventAttendee = async (
  eventId: string,
  attendeeId: string,
): Promise<void> => {
  const response = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', ensureIdentifier(eventId, 'eventId'))
    .eq('id', ensureIdentifier(attendeeId, 'attendeeId'));

  ensureNoError(response, 'Unable to delete event attendee');
};

export const getHolidayCalendar = async (
  companyId: string,
): Promise<HolidayCalendar[]> => {
  const response = await supabase
    .from<HolidayCalendar>('holiday_calendars')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('date', { ascending: true });

  return unwrapList(response, 'Unable to load holiday calendars');
};

export const getHolidayCalendarEntryById = async (
  companyId: string,
  entryId: string,
): Promise<HolidayCalendar> => {
  const response = await supabase
    .from<HolidayCalendar>('holiday_calendars')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(entryId, 'entryId'))
    .maybeSingle();

  const holiday = unwrapMaybeSingle(response, 'Unable to load holiday calendar entry');

  if (!holiday) {
    throw new RepositoryError('Holiday calendar entry not found', { status: 404 });
  }

  return holiday;
};

export const createHolidayCalendarEntry = async (
  companyId: string,
  payload: HolidayCalendarInsert,
): Promise<HolidayCalendar> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<HolidayCalendar>('holiday_calendars')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create holiday calendar entry');
};

export const replaceHolidayCalendarEntry = async (
  companyId: string,
  entryId: string,
  payload: HolidayCalendarReplace,
): Promise<HolidayCalendar> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<HolidayCalendar>('holiday_calendars')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(entryId, 'entryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace holiday calendar entry');
};

export const updateHolidayCalendarEntry = async (
  companyId: string,
  entryId: string,
  payload: HolidayCalendarUpdate,
): Promise<HolidayCalendar> => {
  const response = await supabase
    .from<HolidayCalendar>('holiday_calendars')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(entryId, 'entryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update holiday calendar entry');
};

export const deleteHolidayCalendarEntry = async (
  companyId: string,
  entryId: string,
): Promise<void> => {
  const response = await supabase
    .from('holiday_calendars')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(entryId, 'entryId'));

  ensureNoError(response, 'Unable to delete holiday calendar entry');
};
