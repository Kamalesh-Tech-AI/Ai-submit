'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface ScanResult {
  success: boolean;
  resultType: 'success' | 'already_used' | 'expired' | 'invalid';
  message: string;
  payload?: {
    attendeeName?: string;
    universityName?: string;
    currentCount?: number;
    maxLimit?: number;
    checkedInAt?: string;
  };
}

export async function validateScan(scannedText: string): Promise<ScanResult> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 1. Authorize the scanner (must be staff or admin)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, resultType: 'invalid', message: 'Staff session not found. Please log in.' };
  }

  // Fetch role
  const { data: staffProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !staffProfile || (staffProfile.role !== 'staff' && staffProfile.role !== 'admin')) {
    return { success: false, resultType: 'invalid', message: 'Unauthorized. Staff permissions required.' };
  }

  // 2. Parse scanned payload
  let type: 'individual' | 'bulk' = 'individual';
  let token: string = scannedText;

  try {
    const parsed = JSON.parse(scannedText);
    if (parsed.type && parsed.token) {
      type = parsed.type;
      token = parsed.token;
    }
  } catch {
    // If it's not a JSON, treat the whole string as a token.
    // We will attempt to verify it as an individual registration token,
    // and if that fails, try to find a bulk token.
    token = scannedText.trim();
  }

  // Validate UUID format roughly to prevent database injection/syntax errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    // Log invalid scan
    await adminSupabase.from('scan_logs').insert({
      qr_token: null,
      qr_type: type,
      result: 'invalid',
      scanned_by: user.id,
    });
    return { success: false, resultType: 'invalid', message: 'Invalid QR format.' };
  }

  try {
    // 3. Process scan: Check if this token belongs to an individual attendee first
    const { data: registration, error: regError } = await adminSupabase
      .from('registrations')
      .select(`
        id,
        checked_in,
        checked_in_at,
        profiles:user_id (
          full_name,
          email,
          university
        )
      `)
      .eq('qr_token', token)
      .maybeSingle();

    if (!regError && registration) {
      interface ProfileJoined {
        full_name: string | null;
        university: string | null;
      }
      const profiles = registration.profiles as unknown as ProfileJoined | null;
      const attendeeName = profiles?.full_name || 'Anonymous Attendee';
      const university = profiles?.university || 'Not Specified';

      if (registration.checked_in) {
        // Already checked in
        const checkedInAtStr = registration.checked_in_at 
          ? new Date(registration.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'earlier';

        await adminSupabase.from('scan_logs').insert({
          qr_token: token,
          qr_type: 'individual',
          result: 'already_used',
          attendee_name: attendeeName,
          university_name: university,
          scanned_by: user.id,
        });

        return {
          success: false,
          resultType: 'already_used',
          message: `Already checked in at ${checkedInAtStr}.`,
          payload: {
            attendeeName,
            checkedInAt: registration.checked_in_at || undefined,
          }
        };
      }

      // Mark as checked in
      const checkInTime = new Date().toISOString();
      const { error: updateError } = await adminSupabase
        .from('registrations')
        .update({
          checked_in: true,
          checked_in_at: checkInTime,
        })
        .eq('id', registration.id);

      if (updateError) {
        console.error('Check in write error:', updateError);
        return { success: false, resultType: 'invalid', message: 'Failed to update check-in status.' };
      }

      // Log successful scan
      await adminSupabase.from('scan_logs').insert({
        qr_token: token,
        qr_type: 'individual',
        result: 'success',
        attendee_name: attendeeName,
        university_name: university,
        scanned_by: user.id,
      });

      revalidatePath('/admin');
      return {
        success: true,
        resultType: 'success',
        message: `Welcome, ${attendeeName}! Check-in completed.`,
        payload: {
          attendeeName,
          checkedInAt: checkInTime,
        }
      };
    }

    // 4. Check if it is a bulk group code
    const { data: bulkCode, error: bulkError } = await adminSupabase
      .from('bulk_qr_codes')
      .select('*')
      .eq('qr_token', token)
      .maybeSingle();

    if (!bulkError && bulkCode) {
      const universityName = bulkCode.university_name;
      const limit = bulkCode.max_limit;

      if (bulkCode.status !== 'active') {
        await adminSupabase.from('scan_logs').insert({
          qr_token: token,
          qr_type: 'bulk',
          result: 'expired',
          university_name: universityName,
          scanned_by: user.id,
        });
        return {
          success: false,
          resultType: 'expired',
          message: `Group code for ${universityName} has been ${bulkCode.status}.`,
          payload: { universityName, currentCount: bulkCode.current_count, maxLimit: limit }
        };
      }

      if (bulkCode.current_count >= limit) {
        // Mark as expired
        await adminSupabase.from('bulk_qr_codes').update({ status: 'expired' }).eq('id', bulkCode.id);

        await adminSupabase.from('scan_logs').insert({
          qr_token: token,
          qr_type: 'bulk',
          result: 'expired',
          university_name: universityName,
          scanned_by: user.id,
        });

        return {
          success: false,
          resultType: 'expired',
          message: `Limit reached for ${universityName} (${limit}/${limit} used).`,
          payload: { universityName, currentCount: bulkCode.current_count, maxLimit: limit }
        };
      }

      // Valid scan under limit. Increment count
      const newCount = bulkCode.current_count + 1;
      const nextStatus = newCount >= limit ? 'expired' : 'active';

      const { error: countError } = await adminSupabase
        .from('bulk_qr_codes')
        .update({
          current_count: newCount,
          status: nextStatus,
        })
        .eq('id', bulkCode.id);

      if (countError) {
        console.error('Bulk count update error:', countError);
        return { success: false, resultType: 'invalid', message: 'Failed to update scan count.' };
      }

      // Log successful scan
      await adminSupabase.from('scan_logs').insert({
        qr_token: token,
        qr_type: 'bulk',
        result: 'success',
        university_name: universityName,
        scanned_by: user.id,
      });

      revalidatePath('/admin');
      return {
        success: true,
        resultType: 'success',
        message: `Verified: ${universityName} group entry.`,
        payload: {
          universityName,
          currentCount: newCount,
          maxLimit: limit,
        }
      };
    }

    // 5. Neither individual nor bulk code matched
    await adminSupabase.from('scan_logs').insert({
      qr_token: null,
      qr_type: type,
      result: 'invalid',
      scanned_by: user.id,
    });
    return { success: false, resultType: 'invalid', message: 'QR Code/Token not found in database.' };

  } catch (error: unknown) {
    console.error('Scan validation server action failed:', error);
    return { success: false, resultType: 'invalid', message: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
