'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CompleteRegistrationParams {
  phone: string;
  university: string;
  attendeeType: 'student' | 'professional';
  fullName: string;
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

    // 2. Create the registration entry (generate a unique qr_token if not exist)
    // Check if registration already exists first
    const { data: existingReg, error: fetchRegError } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchRegError) {
      console.error('Fetch registration error:', fetchRegError);
      return { success: false, error: 'Failed to check existing registration.' };
    }

    if (existingReg) {
      // Registration already exists, which is fine
      revalidatePath('/ticket');
      return { success: true };
    }

    // Insert new registration
    const { error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
      });

    if (regError) {
      console.error('Registration insertion error:', regError);
      return { success: false, error: 'Failed to create registration pass.' };
    }

    revalidatePath('/ticket');
    return { success: true };
  } catch (error: unknown) {
    console.error('Registration server action failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
