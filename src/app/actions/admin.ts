'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Registration } from '@/lib/types';

// Helper to verify user has admin/staff permissions
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

export async function getAdminStats() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    // 1. Total registrations
    const { count: totalReg, error: err1 } = await adminSupabase
      .from('registrations')
      .select('id', { count: 'exact', head: true });

    // 2. Checked-in individual count
    const { count: checkedIn, error: err2 } = await adminSupabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('checked_in', true);

    // 3. Bulk QR codes issued
    const { count: totalBulkCodes, error: err3 } = await adminSupabase
      .from('bulk_qr_codes')
      .select('id', { count: 'exact', head: true });

    // 4. Sum of current_count in bulk_qr_codes
    const { data: bulkCounts, error: err4 } = await adminSupabase
      .from('bulk_qr_codes')
      .select('current_count');

    const totalBulkScans = bulkCounts?.reduce((sum, item) => sum + (item.current_count || 0), 0) || 0;

    if (err1 || err2 || err3 || err4) {
      console.error('Stats fetching error:', { err1, err2, err3, err4 });
      throw new Error('Failed to retrieve statistics.');
    }

    return {
      totalRegistrations: totalReg || 0,
      checkedInIndividuals: checkedIn || 0,
      totalBulkIssued: totalBulkCodes || 0,
      checkedInBulk: totalBulkScans,
    };
  } catch (error: unknown) {
    console.error('getAdminStats failed:', error);
    return { error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function createBulkQR(universityName: string, maxLimit: number) {
  try {
    const user = await checkAuth();
    const adminSupabase = createAdminClient();

    if (!universityName || maxLimit <= 0) {
      return { success: false, error: 'Valid university name and positive limit required.' };
    }

    const { data, error } = await adminSupabase
      .from('bulk_qr_codes')
      .insert({
        university_name: universityName,
        max_limit: maxLimit,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Bulk QR insertion error:', error);
      return { success: false, error: 'Failed to create bulk QR code in database.' };
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: unknown) {
    console.error('createBulkQR failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function deactivateBulkQR(id: string) {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('bulk_qr_codes')
      .update({ status: 'deactivated' })
      .eq('id', id);

    if (error) {
      console.error('Bulk QR deactivation error:', error);
      return { success: false, error: 'Failed to update status.' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('deactivateBulkQR failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function getRegistrations() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('registrations')
      .select(`
        id,
        checked_in,
        checked_in_at,
        created_at,
        profiles:user_id (
          full_name,
          email,
          phone,
          university,
          attendee_type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getRegistrations error:', error);
      throw new Error('Failed to load registrations.');
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('getRegistrations failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function getBulkQRCodes() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('bulk_qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getBulkQRCodes error:', error);
      throw new Error('Failed to load bulk codes.');
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('getBulkQRCodes failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function getRecentScanLogs() {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('scan_logs')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('getRecentScanLogs error:', error);
      throw new Error('Failed to load recent logs.');
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('getRecentScanLogs failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error occurred.' };
  }
}

export async function exportRegistrationsCSV(): Promise<string> {
  try {
    await checkAuth();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('registrations')
      .select(`
        id,
        checked_in,
        checked_in_at,
        profiles:user_id (
          full_name,
          email,
          phone,
          university,
          attendee_type
        )
      `);

    if (error || !data) {
      throw new Error('Failed to fetch data for export.');
    }

    const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'University', 'Attendee Type', 'Checked In', 'Checked In At'];
    const rows = (data as unknown as Registration[]).map((reg) => {
      const p = reg.profiles;
      return [
        reg.id,
        p?.full_name || '',
        p?.email || '',
        p?.phone || '',
        p?.university || '',
        p?.attendee_type || '',
        reg.checked_in ? 'TRUE' : 'FALSE',
        reg.checked_in_at || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  } catch (error: unknown) {
    console.error('CSV export failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to export CSV.');
  }
}
