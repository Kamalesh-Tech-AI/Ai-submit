export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  university: string | null;
  attendee_type: 'student' | 'professional';
  role: 'attendee' | 'staff' | 'admin';
  created_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  qr_token: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface BulkQRCode {
  id: string;
  university_name: string;
  max_limit: number;
  current_count: number;
  qr_token: string;
  status: 'active' | 'expired' | 'deactivated';
  created_by: string;
  created_at: string;
}

export interface ScanLog {
  id: string;
  qr_token: string;
  qr_type: 'individual' | 'bulk';
  result: 'success' | 'already_used' | 'expired' | 'invalid';
  university_name: string | null;
  attendee_name: string | null;
  scanned_by: string;
  scanned_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ChiefGuest {
  id: string;
  name: string;
  designation: string;
  organization: string;
  bio: string;
  imageUrl: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker: string | null;
  track: 'Skill Building' | 'Tech Innovation' | 'Keynote' | 'Interactive';
  day: 1 | 2;
}
