'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CompleteRegistrationParams {
  phone: string;
  university: string;
  attendeeType: 'student' | 'professional';
  fullName: string;
  seatNumber?: string;
}

// Trigger N8N Gmail Webhook upon registration confirmation
async function triggerN8nGmailWebhook(payload: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_GMAIL_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('N8N_GMAIL_WEBHOOK_URL is not defined in environment variables. Webhook trigger skipped.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Successfully dispatched registration data to N8N Gmail webhook.');
  } catch (err) {
    console.error('Failed to dispatch registration data to N8N Gmail webhook:', err);
  }
}

export async function getReservedSeats(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('registrations')
      .select('seat_number')
      .not('seat_number', 'is', null);

    if (error) {
      console.error('Error fetching reserved seats:', error);
      return [];
    }

    return (data || []).map((row: { seat_number: string | null }) => row.seat_number).filter(Boolean) as string[];
  } catch (err) {
    console.error('Failed to get reserved seats:', err);
    return [];
  }
}

export async function completeRegistration(params: CompleteRegistrationParams) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'User is not authenticated.' };
  }

  try {
    // 1. Update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: params.fullName,
        phone: params.phone,
        university: params.university,
        attendee_type: params.attendeeType,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return { success: false, error: 'Failed to update profile details.' };
    }

    // 2. Create or update the registration entry
    const { data: existingReg, error: fetchRegError } = await supabase
      .from('registrations')
      .select('id, qr_token, seat_number')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchRegError) {
      console.error('Fetch registration error:', fetchRegError);
      return { success: false, error: 'Failed to check existing registration.' };
    }

    let qrToken = existingReg?.qr_token;
    let seatNum = params.seatNumber || existingReg?.seat_number;

    if (existingReg) {
      // Update seat_number if provided
      if (params.seatNumber) {
        await supabase
          .from('registrations')
          .update({ seat_number: params.seatNumber })
          .eq('id', existingReg.id);
      }
    } else {
      // Insert new registration with seat_number
      const { data: newReg, error: regError } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          seat_number: params.seatNumber || null,
        })
        .select('qr_token, seat_number')
        .single();

      if (regError) {
        console.error('Registration insertion error:', regError);
        return { success: false, error: 'Failed to create registration pass.' };
      }

      qrToken = newReg?.qr_token;
      seatNum = newReg?.seat_number || params.seatNumber;
    }

    // 3. Dispatch N8N Gmail webhook for automated email confirmation
    triggerN8nGmailWebhook({
      event: 'registration_confirmed',
      user_id: user.id,
      full_name: params.fullName,
      email: user.email,
      phone: params.phone,
      university: params.university,
      attendee_type: params.attendeeType,
      seat_number: seatNum || 'Unassigned',
      qr_token: qrToken || '',
      ticket_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ticket`,
      registered_at: new Date().toISOString(),
    });

    revalidatePath('/ticket');
    return { success: true };
  } catch (error: unknown) {
    console.error('Registration server action failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
