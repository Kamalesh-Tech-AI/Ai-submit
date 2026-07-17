'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// Helper to verify user has admin/staff permissions and return user
async function checkAuth() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
    throw new Error('Access denied. Staff permissions required.');
  }

  return user;
}

/**
 * Fetch all active notification templates from the database.
 */
export async function getNotificationTemplates() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getNotificationTemplates error:', error);
      return { success: false, error: 'Failed to load notification templates.' };
    }

    return { success: true, data: data || [] };
  } catch (error: unknown) {
    console.error('getNotificationTemplates failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

/**
 * Fetch notification campaign history.
 */
export async function getNotificationHistory() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('notification_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('getNotificationHistory error:', error);
      return { success: false, error: 'Failed to load notification history.' };
    }

    return { success: true, data: data || [] };
  } catch (error: unknown) {
    console.error('getNotificationHistory failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

/**
 * Fetch recipients (profiles with phone numbers) based on filters.
 */
export async function getRecipients(filters: {
  attendeeType?: string;
  checkedIn?: string;
  university?: string;
}) {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    // First get registrations with profiles
    let query = adminSupabase
      .from('registrations')
      .select(`
        id,
        checked_in,
        profiles:user_id (
          id,
          full_name,
          email,
          phone,
          university,
          attendee_type
        )
      `);

    // Apply check-in filter
    if (filters.checkedIn === 'yes') {
      query = query.eq('checked_in', true);
    } else if (filters.checkedIn === 'no') {
      query = query.eq('checked_in', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getRecipients error:', error);
      return { success: false, error: 'Failed to load recipients.' };
    }

    // Apply profile-level filters client-side (Supabase nested filters are limited)
    type RegistrationWithProfile = {
      id: string;
      checked_in: boolean;
      profiles: {
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        university: string | null;
        attendee_type: string | null;
      } | null;
    };

    let filtered = (data as unknown as RegistrationWithProfile[]) || [];

    if (filters.attendeeType && filters.attendeeType !== 'all') {
      filtered = filtered.filter(
        (r) => r.profiles?.attendee_type === filters.attendeeType
      );
    }

    if (filters.university && filters.university !== 'all') {
      filtered = filtered.filter(
        (r) =>
          r.profiles?.university?.toLowerCase() === filters.university?.toLowerCase()
      );
    }

    // Extract unique profiles with phone numbers
    const recipients = filtered
      .filter((r) => r.profiles?.phone)
      .map((r) => ({
        phone: r.profiles!.phone!,
        name: r.profiles!.full_name || 'Attendee',
        email: r.profiles!.email || '',
        university: r.profiles!.university || '',
      }));

    // Count those without phone numbers
    const withoutPhone = filtered.filter((r) => !r.profiles?.phone).length;

    return {
      success: true,
      data: {
        recipients,
        totalFiltered: filtered.length,
        withPhone: recipients.length,
        withoutPhone,
      },
    };
  } catch (error: unknown) {
    console.error('getRecipients failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

/**
 * Get unique universities from registrations for the filter dropdown.
 */
export async function getUniqueUniversities() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('university')
      .not('university', 'is', null)
      .neq('university', '');

    if (error) {
      console.error('getUniqueUniversities error:', error);
      return { success: false, error: 'Failed to load universities.' };
    }

    const universities = [...new Set(
      (data || [])
        .map((p) => p.university as string)
        .filter(Boolean)
    )].sort();

    return { success: true, data: universities };
  } catch (error: unknown) {
    console.error('getUniqueUniversities failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export interface WhatsAppBlastResult {
  success: boolean;
  message?: string;
  error?: string;
  recipientCount?: number;
}

/**
 * Send WhatsApp blast via N8N webhook.
 * 
 * This is the core action that:
 * 1. Fetches recipients based on filters
 * 2. Posts phone numbers + message to the N8N webhook
 * 3. Logs the campaign in notification_logs
 */
export async function sendWhatsAppBlast(params: {
  templateSlug: string;
  templateName: string;
  resolvedMessage: string;
  filters: {
    attendeeType?: string;
    checkedIn?: string;
    university?: string;
  };
}): Promise<WhatsAppBlastResult> {
  try {
    const user = await checkAuth();
    const adminSupabase = createAdminClient();

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        success: false,
        error: 'N8N Webhook URL is not configured. Please add N8N_WEBHOOK_URL to your environment variables.',
      };
    }

    // 1. Fetch recipients
    const recipientResult = await getRecipients(params.filters);
    if (!recipientResult.success || !recipientResult.data) {
      return {
        success: false,
        error: recipientResult.error || 'Failed to fetch recipients.',
      };
    }

    const { recipients, withPhone } = recipientResult.data;

    if (withPhone === 0) {
      return {
        success: false,
        error: 'No recipients with phone numbers found for the selected filters.',
      };
    }

    // 2. Construct webhook payload
    const payload = {
      recipients: recipients.map((r) => ({
        phone: r.phone,
        name: r.name,
        university: r.university,
      })),
      message: params.resolvedMessage,
      templateSlug: params.templateSlug,
      templateName: params.templateName,
      sentAt: new Date().toISOString(),
      totalRecipients: withPhone,
    };

    // 3. POST to N8N webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let status: 'sent' | 'failed' | 'partial' = 'sent';

    if (!webhookResponse.ok) {
      console.error(
        'N8N webhook returned non-OK status:',
        webhookResponse.status,
        await webhookResponse.text().catch(() => '')
      );
      status = 'failed';
    }

    // 4. Find the template ID from the database
    const { data: templateData } = await adminSupabase
      .from('notification_templates')
      .select('id')
      .eq('slug', params.templateSlug)
      .single();

    // 5. Log the campaign
    const { error: logError } = await adminSupabase
      .from('notification_logs')
      .insert({
        template_id: templateData?.id || null,
        template_name: params.templateName,
        message_sent: params.resolvedMessage,
        recipient_count: withPhone,
        filter_criteria: params.filters,
        status,
        sent_by: user.id,
      });

    if (logError) {
      console.error('Failed to log notification campaign:', logError);
    }

    revalidatePath('/admin/notifications');

    if (status === 'failed') {
      return {
        success: false,
        error: `Webhook call failed (HTTP ${webhookResponse.status}). The campaign has been logged. Check your N8N instance.`,
        recipientCount: withPhone,
      };
    }

    return {
      success: true,
      recipientCount: withPhone,
      message: `Successfully dispatched ${withPhone} WhatsApp notifications via N8N.`,
    };
  } catch (error: unknown) {
    console.error('sendWhatsAppBlast failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }
}
