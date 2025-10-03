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
  NotificationChannel,
  NotificationChannelInsert,
  NotificationChannelReplace,
  NotificationChannelUpdate,
  NotificationDelivery,
  NotificationDeliveryInsert,
  NotificationDeliveryReplace,
  NotificationDeliveryUpdate,
  NotificationInsert,
  NotificationRecord,
  NotificationReplace,
  NotificationUpdate,
} from '@/types/db';

export const getNotificationChannels = async (
  userId: string,
  companyId?: string | null,
): Promise<NotificationChannel[]> => {
  let query = supabase
    .from<NotificationChannel>('notification_channels')
    .select('*')
    .eq('user_id', ensureIdentifier(userId, 'userId'))
    .order('created_at', { ascending: true });

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const response = await query;

  return unwrapList(response, 'Unable to load notification channels');
};

export const getNotificationChannelById = async (
  channelId: string,
): Promise<NotificationChannel> => {
  const response = await supabase
    .from<NotificationChannel>('notification_channels')
    .select('*')
    .eq('id', ensureIdentifier(channelId, 'channelId'))
    .maybeSingle();

  const channel = unwrapMaybeSingle(response, 'Unable to load notification channel');

  if (!channel) {
    throw new RepositoryError('Notification channel not found', { status: 404 });
  }

  return channel;
};

export const createNotificationChannel = async (
  payload: NotificationChannelInsert,
): Promise<NotificationChannel> => {
  const response = await supabase
    .from<NotificationChannel>('notification_channels')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create notification channel');
};

export const replaceNotificationChannel = async (
  channelId: string,
  payload: NotificationChannelReplace,
): Promise<NotificationChannel> => {
  const response = await supabase
    .from<NotificationChannel>('notification_channels')
    .update(payload)
    .eq('id', ensureIdentifier(channelId, 'channelId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace notification channel');
};

export const updateNotificationChannel = async (
  channelId: string,
  payload: NotificationChannelUpdate,
): Promise<NotificationChannel> => {
  const response = await supabase
    .from<NotificationChannel>('notification_channels')
    .update(payload)
    .eq('id', ensureIdentifier(channelId, 'channelId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update notification channel');
};

export const deleteNotificationChannel = async (
  channelId: string,
): Promise<void> => {
  const response = await supabase
    .from('notification_channels')
    .delete()
    .eq('id', ensureIdentifier(channelId, 'channelId'));

  ensureNoError(response, 'Unable to delete notification channel');
};

export const getNotifications = async (
  companyId: string,
): Promise<NotificationRecord[]> => {
  const response = await supabase
    .from<NotificationRecord>('notifications')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: false });

  return unwrapList(response, 'Unable to load notifications');
};

export const getNotificationById = async (
  companyId: string,
  notificationId: string,
): Promise<NotificationRecord> => {
  const response = await supabase
    .from<NotificationRecord>('notifications')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(notificationId, 'notificationId'))
    .maybeSingle();

  const notification = unwrapMaybeSingle(response, 'Unable to load notification');

  if (!notification) {
    throw new RepositoryError('Notification not found', { status: 404 });
  }

  return notification;
};

export const createNotification = async (
  companyId: string,
  payload: NotificationInsert,
): Promise<NotificationRecord> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<NotificationRecord>('notifications')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create notification');
};

export const replaceNotification = async (
  companyId: string,
  notificationId: string,
  payload: NotificationReplace,
): Promise<NotificationRecord> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<NotificationRecord>('notifications')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(notificationId, 'notificationId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace notification');
};

export const updateNotification = async (
  companyId: string,
  notificationId: string,
  payload: NotificationUpdate,
): Promise<NotificationRecord> => {
  const response = await supabase
    .from<NotificationRecord>('notifications')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(notificationId, 'notificationId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update notification');
};

export const deleteNotification = async (
  companyId: string,
  notificationId: string,
): Promise<void> => {
  const response = await supabase
    .from('notifications')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(notificationId, 'notificationId'));

  ensureNoError(response, 'Unable to delete notification');
};

export const getNotificationDeliveries = async (
  notificationId: string,
): Promise<NotificationDelivery[]> => {
  const response = await supabase
    .from<NotificationDelivery>('notification_deliveries')
    .select('*')
    .eq('notification_id', ensureIdentifier(notificationId, 'notificationId'))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load notification deliveries');
};

export const getNotificationDeliveryById = async (
  deliveryId: string,
): Promise<NotificationDelivery> => {
  const response = await supabase
    .from<NotificationDelivery>('notification_deliveries')
    .select('*')
    .eq('id', ensureIdentifier(deliveryId, 'deliveryId'))
    .maybeSingle();

  const delivery = unwrapMaybeSingle(response, 'Unable to load notification delivery');

  if (!delivery) {
    throw new RepositoryError('Notification delivery not found', { status: 404 });
  }

  return delivery;
};

export const createNotificationDelivery = async (
  payload: NotificationDeliveryInsert,
): Promise<NotificationDelivery> => {
  const response = await supabase
    .from<NotificationDelivery>('notification_deliveries')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create notification delivery');
};

export const replaceNotificationDelivery = async (
  deliveryId: string,
  payload: NotificationDeliveryReplace,
): Promise<NotificationDelivery> => {
  const response = await supabase
    .from<NotificationDelivery>('notification_deliveries')
    .update(payload)
    .eq('id', ensureIdentifier(deliveryId, 'deliveryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace notification delivery');
};

export const updateNotificationDelivery = async (
  deliveryId: string,
  payload: NotificationDeliveryUpdate,
): Promise<NotificationDelivery> => {
  const response = await supabase
    .from<NotificationDelivery>('notification_deliveries')
    .update(payload)
    .eq('id', ensureIdentifier(deliveryId, 'deliveryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update notification delivery');
};

export const deleteNotificationDelivery = async (
  deliveryId: string,
): Promise<void> => {
  const response = await supabase
    .from('notification_deliveries')
    .delete()
    .eq('id', ensureIdentifier(deliveryId, 'deliveryId'));

  ensureNoError(response, 'Unable to delete notification delivery');
};
