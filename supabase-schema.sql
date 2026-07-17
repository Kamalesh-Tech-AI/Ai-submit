-- ============================================
-- AI Submit 2026 — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- ============================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Helper function to avoid infinite recursion on RLS Policies
-- Marked as SECURITY DEFINER to bypass RLS inside the function context
create or replace function public.is_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
end;
$$ language plpgsql security definer;

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  phone text,
  university text,
  attendee_type text default 'student',  -- student | professional
  role text default 'attendee',          -- attendee | staff | admin
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Drop policies if they exist to avoid duplicate errors
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Staff can read all profiles" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Staff can read all profiles"
  on public.profiles for select using (public.is_staff());


-- 2. REGISTRATIONS
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  qr_token uuid default gen_random_uuid() unique,
  checked_in boolean default false,
  checked_in_at timestamptz,
  created_at timestamptz default now()
);

alter table public.registrations enable row level security;

drop policy if exists "Users can read own registration" on public.registrations;
drop policy if exists "Users can insert own registration" on public.registrations;
drop policy if exists "Staff can read all registrations" on public.registrations;
drop policy if exists "Staff can update registrations" on public.registrations;

create policy "Users can read own registration"
  on public.registrations for select using (auth.uid() = user_id);

create policy "Users can insert own registration"
  on public.registrations for insert with check (auth.uid() = user_id);

create policy "Staff can read all registrations"
  on public.registrations for select using (public.is_staff());

create policy "Staff can update registrations"
  on public.registrations for update using (public.is_staff());


-- 3. BULK QR CODES
create table if not exists public.bulk_qr_codes (
  id uuid primary key default gen_random_uuid(),
  university_name text not null,
  max_limit int not null,
  current_count int default 0,
  qr_token uuid default gen_random_uuid() unique,
  status text default 'active',  -- active | expired | deactivated
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.bulk_qr_codes enable row level security;

drop policy if exists "Staff can manage bulk QR codes" on public.bulk_qr_codes;

create policy "Staff can manage bulk QR codes"
  on public.bulk_qr_codes for all using (public.is_staff());


-- 4. SCAN LOGS
create table if not exists public.scan_logs (
  id uuid primary key default gen_random_uuid(),
  qr_token uuid,
  qr_type text,      -- individual | bulk
  result text,        -- success | already_used | expired | invalid
  university_name text,
  attendee_name text,
  scanned_by uuid references public.profiles(id),
  scanned_at timestamptz default now()
);

alter table public.scan_logs enable row level security;

drop policy if exists "Staff can manage scan logs" on public.scan_logs;

create policy "Staff can manage scan logs"
  on public.scan_logs for all using (public.is_staff());


-- 5. CONTACT MESSAGES
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
drop policy if exists "Staff can read contact messages" on public.contact_messages;

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert with check (true);

create policy "Staff can read contact messages"
  on public.contact_messages for select using (public.is_staff());


-- 6. FUNCTION: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Attendee'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger creation (drop first if exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================
-- 7. NOTIFICATION TEMPLATES
-- ============================================
create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  message_body text not null,
  category text default 'general',  -- general | reminder | update | seating
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.notification_templates enable row level security;

drop policy if exists "Staff can manage notification templates" on public.notification_templates;
create policy "Staff can manage notification templates"
  on public.notification_templates for all using (public.is_staff());


-- ============================================
-- 8. NOTIFICATION LOGS
-- ============================================
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.notification_templates(id),
  template_name text not null,
  message_sent text not null,
  recipient_count int not null,
  filter_criteria jsonb,
  status text default 'sent',  -- sent | failed | partial
  sent_by uuid references public.profiles(id),
  sent_at timestamptz default now()
);

alter table public.notification_logs enable row level security;

drop policy if exists "Staff can manage notification logs" on public.notification_logs;
create policy "Staff can manage notification logs"
  on public.notification_logs for all using (public.is_staff());


-- ============================================
-- 9. SEED DEFAULT NOTIFICATION TEMPLATES
-- ============================================
insert into public.notification_templates (name, slug, message_body, category) values
  (
    '⏰ Time Reminder',
    'time_reminder',
    '🕐 Reminder: AI Submit 2026 starts in {{hours_until}} hours! Registration opens at 9:00 AM on {{event_date}} at {{venue}}. Don''t forget your QR pass! 🎫',
    'reminder'
  ),
  (
    '🎤 Chief Guest Update',
    'chief_guest_update',
    '🌟 Exciting Update! {{guest_name}} ({{guest_designation}}, {{guest_org}}) will be speaking at AI Submit 2026. Don''t miss their session: "{{session_title}}" at {{session_time}}! 🎓',
    'update'
  ),
  (
    '💺 Seating Reminder',
    'seating_reminder',
    '📍 Seating Reminder: Please be seated by {{session_time}} for the upcoming session "{{session_title}}". Hall doors close 5 minutes after start time. See you inside! 🏛️',
    'seating'
  ),
  (
    '📢 General Announcement',
    'general_announcement',
    '📢 AI Submit 2026 Update: {{custom_message}}',
    'general'
  ),
  (
    '✅ Check-in Reminder',
    'checkin_reminder',
    '🎫 Don''t forget to check in! Show your QR code at the registration desk when you arrive at AI Submit 2026. See you at {{venue}} on {{event_date}}! ✨',
    'reminder'
  ),
  (
    '🎉 Event Day Welcome',
    'event_day_welcome',
    '🎉 Welcome to AI Submit 2026, {{attendee_name}}! Today''s highlights: {{day_highlights}}. WiFi: AISubmit2026 | Support: Help Desk near Registration. Enjoy! 🚀',
    'general'
  )
on conflict (slug) do nothing;
