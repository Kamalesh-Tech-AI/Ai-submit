import { CHIEF_GUESTS, AGENDA_ITEMS, EVENT_DATE } from './mock-data';

/**
 * Default notification templates with placeholder metadata.
 * These are also seeded into the Supabase `notification_templates` table.
 */

export interface TemplatePlaceholder {
  key: string;
  label: string;
  type: 'auto' | 'manual';  // auto = resolved from data, manual = admin types it
  defaultValue?: string;
}

export interface TemplateConfig {
  slug: string;
  name: string;
  category: 'general' | 'reminder' | 'update' | 'seating';
  icon: string;
  description: string;
  messageBody: string;
  placeholders: TemplatePlaceholder[];
}

const eventDate = new Date(EVENT_DATE);
const formattedDate = eventDate.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const DEFAULT_VENUE = 'Chennai Trade Centre, Nandambakkam';

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    slug: 'time_reminder',
    name: '⏰ Time Reminder',
    category: 'reminder',
    icon: '⏰',
    description: 'Remind attendees about the event start time and encourage them to arrive on time.',
    messageBody: '🕐 Reminder: AI Summit 2026 starts in {{hours_until}} hours! Registration opens at 9:00 AM on {{event_date}} at {{venue}}. Don\'t forget your QR pass! 🎫',
    placeholders: [
      { key: 'hours_until', label: 'Hours Until Event', type: 'manual', defaultValue: '24' },
      { key: 'event_date', label: 'Event Date', type: 'auto', defaultValue: formattedDate },
      { key: 'venue', label: 'Venue', type: 'auto', defaultValue: DEFAULT_VENUE },
    ],
  },
  {
    slug: 'chief_guest_update',
    name: '🎤 Chief Guest Update',
    category: 'update',
    icon: '🎤',
    description: 'Notify attendees about a confirmed chief guest or speaker and their session details.',
    messageBody: '🌟 Exciting Update! {{guest_name}} ({{guest_designation}}, {{guest_org}}) will be speaking at AI Summit 2026. Don\'t miss their session: "{{session_title}}" at {{session_time}}! 🎓',
    placeholders: [
      { key: 'guest_name', label: 'Guest Name', type: 'manual', defaultValue: CHIEF_GUESTS[0]?.name || '' },
      { key: 'guest_designation', label: 'Designation', type: 'manual', defaultValue: CHIEF_GUESTS[0]?.designation || '' },
      { key: 'guest_org', label: 'Organization', type: 'manual', defaultValue: CHIEF_GUESTS[0]?.organization || '' },
      { key: 'session_title', label: 'Session Title', type: 'manual', defaultValue: AGENDA_ITEMS[1]?.title || '' },
      { key: 'session_time', label: 'Session Time', type: 'manual', defaultValue: AGENDA_ITEMS[1]?.time || '' },
    ],
  },
  {
    slug: 'seating_reminder',
    name: '💺 Seating Reminder',
    category: 'seating',
    icon: '💺',
    description: 'Remind attendees to be seated before a specific session begins.',
    messageBody: '📍 Seating Reminder: Please be seated by {{session_time}} for the upcoming session "{{session_title}}". Hall doors close 5 minutes after start time. See you inside! 🏛️',
    placeholders: [
      { key: 'session_time', label: 'Session Time', type: 'manual', defaultValue: '' },
      { key: 'session_title', label: 'Session Title', type: 'manual', defaultValue: '' },
    ],
  },
  {
    slug: 'general_announcement',
    name: '📢 General Announcement',
    category: 'general',
    icon: '📢',
    description: 'Send a custom announcement or update to all attendees.',
    messageBody: '📢 AI Summit 2026 Update: {{custom_message}}',
    placeholders: [
      { key: 'custom_message', label: 'Your Message', type: 'manual', defaultValue: '' },
    ],
  },
  {
    slug: 'checkin_reminder',
    name: '✅ Check-in Reminder',
    category: 'reminder',
    icon: '✅',
    description: 'Remind attendees to check in with their QR code at the venue.',
    messageBody: '🎫 Don\'t forget to check in! Show your QR code at the registration desk when you arrive at AI Summit 2026. See you at {{venue}} on {{event_date}}! ✨',
    placeholders: [
      { key: 'venue', label: 'Venue', type: 'auto', defaultValue: DEFAULT_VENUE },
      { key: 'event_date', label: 'Event Date', type: 'auto', defaultValue: formattedDate },
    ],
  },
  {
    slug: 'event_day_welcome',
    name: '🎉 Event Day Welcome',
    category: 'general',
    icon: '🎉',
    description: 'Welcome attendees on the day of the event with key highlights and logistics info.',
    messageBody: '🎉 Welcome to AI Summit 2026, {{attendee_name}}! Today\'s highlights: {{day_highlights}}. WiFi: AISummit2026 | Support: Help Desk near Registration. Enjoy! 🚀',
    placeholders: [
      { key: 'attendee_name', label: 'Attendee Name', type: 'auto', defaultValue: '' },
      { key: 'day_highlights', label: 'Day Highlights', type: 'manual', defaultValue: 'Inaugural Keynote, Panel Discussion on Fintech, AI in Medical Imaging' },
    ],
  },
];

/**
 * Resolves placeholders in a message template with provided values.
 */
export function resolveTemplate(
  messageBody: string,
  values: Record<string, string>
): string {
  let resolved = messageBody;
  for (const [key, value] of Object.entries(values)) {
    resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`);
  }
  return resolved;
}

/**
 * Gets the TemplateConfig for a given slug
 */
export function getTemplateBySlug(slug: string): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS.find((t) => t.slug === slug);
}
