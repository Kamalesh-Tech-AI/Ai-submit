# 🔄 Complete WhatsApp Automation Setup Guide
## Supabase → Next.js Admin Dashboard → N8N → WhatsApp Business API

> **AI Submit 2026 — Mass Notification Pipeline**
> This guide walks you through every single step to get WhatsApp notifications working end-to-end, from your Supabase database all the way to attendees' WhatsApp inboxes.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 1: Supabase Database Setup](#2-phase-1-supabase-database-setup)
3. [Phase 2: N8N Instance Setup](#3-phase-2-n8n-instance-setup)
4. [Phase 3: WhatsApp Business API Setup](#4-phase-3-whatsapp-business-api-setup)
5. [Phase 4: N8N Workflow Creation (Step-by-Step)](#5-phase-4-n8n-workflow-creation-step-by-step)
6. [Phase 5: Connect Everything](#6-phase-5-connect-everything)
7. [Phase 6: Testing the Full Pipeline](#7-phase-6-testing-the-full-pipeline)
8. [Appendix: Troubleshooting & FAQ](#8-appendix-troubleshooting--faq)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           YOUR SYSTEM OVERVIEW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SUPABASE (Database)              NEXT.JS (Admin Dashboard)                │
│   ┌─────────────────┐             ┌──────────────────────┐                  │
│   │ profiles        │◄────────────│ /admin/notifications │                  │
│   │  • full_name    │  Reads      │                      │                  │
│   │  • phone        │  attendee   │  1. Select Template  │                  │
│   │  • university   │  data       │  2. Filter Recipients│                  │
│   │  • attendee_type│             │  3. Fill Placeholders│                  │
│   ├─────────────────┤             │  4. Preview Message  │                  │
│   │ registrations   │             │  5. Click "Send"     │                  │
│   │  • checked_in   │             └──────────┬───────────┘                  │
│   │  • user_id      │                        │                              │
│   ├─────────────────┤                        │ POST JSON payload            │
│   │ notification_   │                        │ (recipients[] + message)      │
│   │ templates       │                        ▼                              │
│   │  • message_body │             ┌──────────────────────┐                  │
│   │  • slug         │             │  N8N WEBHOOK         │                  │
│   ├─────────────────┤             │  /whatsapp-notify    │                  │
│   │ notification_   │◄────────────│                      │                  │
│   │ logs            │  Logs       │  Receives:           │                  │
│   │  • status       │  campaign   │  {                   │                  │
│   │  • recipient_   │  result     │    recipients: [...] │                  │
│   │    count        │             │    message: "..."    │                  │
│   └─────────────────┘             │    templateSlug: ""  │                  │
│                                   │  }                   │                  │
│                                   └──────────┬───────────┘                  │
│                                              │                              │
│                                              ▼                              │
│                                   ┌──────────────────────┐                  │
│                                   │  N8N WORKFLOW         │                  │
│                                   │                       │                  │
│                                   │  For each recipient:  │                  │
│                                   │  ┌─────────────────┐  │                  │
│                                   │  │ Extract phone # │  │                  │
│                                   │  │ Format message  │  │                  │
│                                   │  │ Call WhatsApp   │  │                  │
│                                   │  │ Business API    │  │                  │
│                                   │  │ Wait 1-2 sec    │  │                  │
│                                   │  └─────────────────┘  │                  │
│                                   └──────────┬───────────┘                  │
│                                              │                              │
│                                              ▼                              │
│                                   ┌──────────────────────┐                  │
│                                   │  WHATSAPP BUSINESS   │                  │
│                                   │  CLOUD API           │                  │
│                                   │                       │                  │
│                                   │  Delivers message to │                  │
│                                   │  each attendee's     │                  │
│                                   │  WhatsApp number     │                  │
│                                   └──────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow (Numbered Steps)

| Step | From | To | What Happens |
|------|------|----|-------------|
| **1** | Admin | Dashboard | Admin logs into `/admin`, navigates to `/admin/notifications` |
| **2** | Dashboard | Supabase | Dashboard reads `profiles` + `registrations` tables to show recipient count |
| **3** | Admin | Dashboard | Admin selects template, filters recipients, fills placeholders, clicks Send |
| **4** | Dashboard | Supabase | Server action queries recipients matching the filters |
| **5** | Dashboard | N8N | Server action POSTs JSON payload to N8N webhook URL |
| **6** | N8N | N8N | Workflow extracts recipients array, loops through each one |
| **7** | N8N | WhatsApp API | For each recipient, N8N calls WhatsApp Business Cloud API to send message |
| **8** | WhatsApp | Attendee | Message arrives on the attendee's WhatsApp |
| **9** | Dashboard | Supabase | Campaign is logged in `notification_logs` table |

---

## 2. Phase 1: Supabase Database Setup

### Step 2.1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **AI Submit 2026** project (`kenbkphrutpoxuplyddv`)
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2.2: Create Notification Tables

Copy and paste **ONLY** the following SQL (the new sections from your schema) and click **Run**:

```sql
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
```

✅ You should see: **Success. No rows returned** — This means the tables were created.

### Step 2.3: Seed the Default Templates

Run this in a **new query**:

```sql
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
```

### Step 2.4: Verify the Setup

Run this query to confirm everything is in place:

```sql
-- Check templates were seeded
select name, slug, category from public.notification_templates order by created_at;

-- Check the notification_logs table exists (should return 0 rows)
select count(*) from public.notification_logs;
```

Expected result: **6 template rows** and **0 log rows**.

### Step 2.5: Ensure Phone Numbers Exist

For WhatsApp to work, your attendees need phone numbers in their profiles. Check how many have them:

```sql
-- Count profiles WITH phone numbers
select count(*) as has_phone 
from public.profiles 
where phone is not null and phone != '';

-- Count profiles WITHOUT phone numbers
select count(*) as no_phone 
from public.profiles 
where phone is null or phone = '';

-- Sample some profiles with phones
select full_name, phone, university, attendee_type 
from public.profiles 
where phone is not null and phone != '' 
limit 10;
```

> ⚠️ **Important**: If most profiles don't have phone numbers, WhatsApp notifications won't reach them. Ensure your registration form collects phone numbers with country code (e.g., `+919876543210`).

---

## 3. Phase 2: N8N Instance Setup

You have two options for running N8N:

### Option A: N8N Cloud (Recommended for Quick Setup)

1. Go to [https://n8n.io](https://n8n.io) and sign up for a free account
2. You get a hosted instance at `https://your-name.app.n8n.cloud`
3. No server management needed
4. Free tier: 5 workflows, 5,000 executions/month

### Option B: Self-Hosted N8N (For Full Control)

```bash
# Using Docker (simplest self-hosted option)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

Or deploy on:
- **Railway**: [https://railway.app](https://railway.app) — One-click N8N template
- **Render**: [https://render.com](https://render.com) — Docker deploy
- **Your own VPS**: Any server with Docker installed

### Verify N8N is Running

1. Open your N8N instance URL
2. Create an account / log in
3. You should see the N8N workflow editor
4. ✅ Ready for Phase 4

---

## 4. Phase 3: WhatsApp Business API Setup

### Option A: Meta WhatsApp Business Cloud API (Recommended — Free Tier)

This is the **official** WhatsApp API. It allows 1,000 free business-initiated conversations per month.

#### Step 4A.1: Create a Meta Developer Account

1. Go to [https://developers.facebook.com](https://developers.facebook.com)
2. Click **Get Started** → Create a developer account
3. Accept the terms and complete verification

#### Step 4A.2: Create a Meta App

1. In the Meta Developer Dashboard → **My Apps** → **Create App**
2. Select **Other** as the use case
3. Select **Business** as the app type
4. Give it a name: `AI Submit 2026 Notifications`
5. Click **Create App**

#### Step 4A.3: Add WhatsApp Product

1. In your app dashboard, scroll to **Add Products**
2. Find **WhatsApp** and click **Set Up**
3. You'll be guided to the WhatsApp **Getting Started** page
4. Note down these values (you'll need them for N8N):

| Value | Where to Find | Example |
|-------|---------------|---------|
| **Phone Number ID** | WhatsApp → Getting Started → Phone Number ID | `123456789012345` |
| **WhatsApp Business Account ID** | WhatsApp → Getting Started → WABA ID | `987654321098765` |
| **Temporary Access Token** | WhatsApp → Getting Started → Access Token | `EAAGx...` (expires in 24h) |

#### Step 4A.4: Generate a Permanent Access Token

The temporary token expires. To create a permanent one:

1. Go to **Business Settings** → [https://business.facebook.com/settings](https://business.facebook.com/settings)
2. Navigate to **System Users** → **Add**
3. Create a system user named `n8n-whatsapp-bot`
4. Assign **Admin** role
5. Click **Generate Token**:
   - Select your app `AI Submit 2026 Notifications`
   - Check permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Click **Generate Token**
6. **Copy and save this token securely** — this is your permanent access token

#### Step 4A.5: Add a Test Phone Number

1. In WhatsApp → **Getting Started**
2. Under **Send messages to**, click **Add Phone Number**
3. Add your own number first for testing
4. You'll receive a verification code on WhatsApp

#### Step 4A.6: Register Your Business Phone Number (For Production)

For production use, you need to register a real business phone number:

1. Go to WhatsApp → **Phone Numbers** → **Add Phone Number**
2. Enter your business phone number
3. Verify via SMS or Voice call
4. Set a display name and business profile

> 📌 **Important**: For sending messages to people who haven't messaged you first, you need **approved message templates**. See Step 4A.7.

#### Step 4A.7: Create Message Templates (Required for Business-Initiated Messages)

WhatsApp requires pre-approved templates for outbound messages. Create one:

1. Go to WhatsApp → **Message Templates** → **Create Template**
2. Configure:
   - **Category**: `UTILITY` (for reminders/updates)
   - **Name**: `ai_submit_notification`
   - **Language**: English
   - **Body**: 
     ```
     {{1}}
     ```
     *(Single variable that receives the full message text)*
3. Click **Submit for Review**
4. Wait for approval (usually 1–24 hours)

**Alternative: Create specific templates for each type:**

| Template Name | Category | Body |
|---|---|---|
| `event_reminder` | UTILITY | `🕐 Reminder: {{1}} starts in {{2}} hours at {{3}}. Don't forget your QR pass! 🎫` |
| `guest_announcement` | UTILITY | `🌟 Exciting Update! {{1}} will be speaking at AI Submit 2026. Session: "{{2}}" at {{3}} 🎓` |
| `seating_alert` | UTILITY | `📍 Please be seated by {{1}} for "{{2}}". Doors close 5 minutes after start. 🏛️` |
| `general_update` | MARKETING | `📢 AI Submit 2026: {{1}}` |

---

### Option B: Twilio WhatsApp (Alternative — Pay-Per-Message)

If you prefer Twilio:

1. Sign up at [https://www.twilio.com](https://www.twilio.com)
2. Get a Twilio phone number with WhatsApp capability
3. For testing: Use the **WhatsApp Sandbox** (free)
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Join the sandbox by sending `join <your-sandbox-keyword>` to the Twilio number
4. Note your **Account SID**, **Auth Token**, and **Twilio WhatsApp number**

---

## 5. Phase 4: N8N Workflow Creation (Step-by-Step)

This is the core automation. Follow each step exactly.

### Step 5.1: Create a New Workflow

1. Open N8N
2. Click **+ New Workflow** (top right)
3. Name it: `AI Submit - WhatsApp Mass Notifications`

### Step 5.2: Add the Webhook Trigger Node

This is the entry point — it receives the POST request from your admin dashboard.

1. Click **+** to add a node
2. Search for **Webhook** → Select it
3. Configure:

| Setting | Value |
|---------|-------|
| **HTTP Method** | `POST` |
| **Path** | `whatsapp-notify` |
| **Authentication** | `None` (or `Header Auth` for production — see security section) |
| **Response Mode** | `When Last Node Finishes` |
| **Response Code** | `200` |

4. Click **Listen for Test Event** (we'll test this later)
5. **Copy the Production URL** — it looks like:
   ```
   https://your-name.app.n8n.cloud/webhook/whatsapp-notify
   ```

> 📌 **Save this URL** — You'll put it in your `.env.local` file.

### Step 5.3: Add a Code Node to Extract Recipients

This node transforms the incoming payload into individual items for the loop.

1. Click **+** after the Webhook node
2. Search for **Code** → Select it
3. Name it: `Extract Recipients`
4. Set **Mode**: `Run Once for All Items`
5. Paste this JavaScript code:

```javascript
// Extract the recipients array and message from the webhook payload
const webhookData = $input.first().json.body;

// Handle both cases: data might be in .body or directly in the json
const data = webhookData || $input.first().json;

const recipients = data.recipients || [];
const message = data.message || '';
const templateSlug = data.templateSlug || '';
const templateName = data.templateName || '';
const sentAt = data.sentAt || new Date().toISOString();

if (recipients.length === 0) {
  throw new Error('No recipients found in the webhook payload');
}

// Return each recipient as a separate item with the message attached
return recipients.map(recipient => ({
  json: {
    phone: recipient.phone,
    name: recipient.name || 'Attendee',
    university: recipient.university || '',
    message: message,
    templateSlug: templateSlug,
    templateName: templateName,
    sentAt: sentAt,
    // Format phone for WhatsApp API (remove + prefix, spaces, dashes)
    phoneFormatted: recipient.phone.replace(/[\s\-\+]/g, '')
  }
}));
```

### Step 5.4: Add a Loop Node (Split In Batches)

This processes recipients one at a time to respect API rate limits.

1. Click **+** after the Code node
2. Search for **Loop Over Items** (or **Split In Batches**)
3. Configure:
   - **Batch Size**: `1`
4. This creates a loop with two outputs: **Loop** and **Done**

### Step 5.5: Add a Wait Node (Rate Limiting)

Prevents hitting WhatsApp API rate limits.

1. Click **+** on the **Loop** output of the batch node
2. Search for **Wait** → Select it
3. Configure:
   - **Resume**: `After Time Interval`
   - **Amount**: `1`
   - **Unit**: `Seconds`

> 💡 For large batches (500+ recipients), increase to 2 seconds.

### Step 5.6: Add the WhatsApp Node

#### If Using Meta WhatsApp Business Cloud API:

1. Click **+** after the Wait node
2. Search for **WhatsApp Business Cloud** → Select it
3. **Create Credentials**:
   - Click the **Credential** dropdown → **Create New**
   - Enter your **Access Token** (the permanent one from Step 4A.4)
   - Click **Save**
4. Configure the node:

| Setting | Value |
|---------|-------|
| **Resource** | `Message` |
| **Operation** | `Send` |
| **Phone Number ID** | Your Phone Number ID from Step 4A.3 |
| **Recipient Phone Number** | `{{ $json.phoneFormatted }}` |

5. For the message content, you have two sub-options:

**Sub-Option A: Using an Approved Template** (Recommended for production)

| Setting | Value |
|---------|-------|
| **Message Type** | `Template` |
| **Template Name** | `ai_submit_notification` (from Step 4A.7) |
| **Language Code** | `en` |
| **Template Parameters** | Add parameter: `{{ $json.message }}` |

**Sub-Option B: Using Free-Form Text** (Only works within 24hr window)

| Setting | Value |
|---------|-------|
| **Message Type** | `Text` |
| **Message** | `{{ $json.message }}` |

> ⚠️ **Critical**: Free-form text messages only work if the recipient has messaged your business number within the last 24 hours. For first-contact outbound messaging, you **must** use approved templates.

#### If Using Twilio:

1. Click **+** after the Wait node
2. Search for **Twilio** → Select it
3. **Create Credentials**:
   - Account SID
   - Auth Token
4. Configure:

| Setting | Value |
|---------|-------|
| **Resource** | `SMS` |
| **Operation** | `Send` |
| **From** | `whatsapp:+14155238886` (your Twilio WhatsApp number) |
| **To** | `whatsapp:+{{ $json.phoneFormatted }}` |
| **Message** | `{{ $json.message }}` |

#### If Using a Generic HTTP API:

1. Click **+** after the Wait node
2. Search for **HTTP Request** → Select it
3. Configure:

| Setting | Value |
|---------|-------|
| **Method** | `POST` |
| **URL** | `https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages` |
| **Authentication** | `Generic Credential Type` → `Header Auth` |
| **Header Name** | `Authorization` |
| **Header Value** | `Bearer YOUR_ACCESS_TOKEN` |
| **Body Content Type** | `JSON` |
| **Body** | See below |

```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.phoneFormatted }}",
  "type": "template",
  "template": {
    "name": "ai_submit_notification",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "{{ $json.message }}"
          }
        ]
      }
    ]
  }
}
```

### Step 5.7: Connect the Loop Back

1. Connect the **output** of the WhatsApp/Twilio/HTTP node **back** to the Loop node's input
2. The **Done** output of the Loop node should connect to the final response (or end)

### Step 5.8: Add Error Handling (Optional but Recommended)

1. On the WhatsApp node, click the **⚙️ Settings** icon
2. Enable **Continue On Fail** → Set to `true`
3. This ensures one failed delivery doesn't stop the entire batch

To log errors:

1. Add a **Code** node after the WhatsApp node:

```javascript
const statusCode = $input.first().json.statusCode || 200;
const error = $input.first().json.error || null;

if (error || statusCode >= 400) {
  console.log(`Failed to send to ${$input.first().json.phone}: ${error}`);
  return [{
    json: {
      ...$input.first().json,
      deliveryStatus: 'failed',
      errorMessage: error || `HTTP ${statusCode}`
    }
  }];
}

return [{
  json: {
    ...$input.first().json,
    deliveryStatus: 'sent'
  }
}];
```

### Complete N8N Workflow Layout

```
┌──────────────────┐
│  WEBHOOK TRIGGER │ ← Receives POST from admin dashboard
│  POST /whatsapp- │
│  notify          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CODE NODE       │ ← Extracts recipients[] into separate items
│  "Extract        │
│   Recipients"    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  LOOP OVER ITEMS │ ← Processes 1 recipient at a time
│  Batch Size: 1   │
│                  │
│  ┌─Loop──────┐   │
│  │           │   │
│  │  ┌────────▼──────────┐
│  │  │  WAIT NODE        │ ← 1-2 second delay
│  │  │  1 second         │
│  │  └────────┬──────────┘
│  │           │
│  │  ┌────────▼──────────┐
│  │  │  WHATSAPP NODE    │ ← Sends message via API
│  │  │  Send Template    │
│  │  │  To: phoneFormatted│
│  │  │  Message: message  │
│  │  └────────┬──────────┘
│  │           │
│  └───────────┘ (back to loop)
│                  │
│  ──Done──────────┘
│         │
│         ▼
│  ┌──────────────────┐
│  │  RESPOND TO      │ ← Returns success to dashboard
│  │  WEBHOOK         │
│  │  { success: true}│
│  └──────────────────┘
└──────────────────┘
```

### Step 5.9: Save and Activate

1. Click **Save** (top right)
2. Toggle the workflow to **Active** (top right switch)
3. The webhook is now live and listening for requests

---

## 6. Phase 5: Connect Everything

### Step 6.1: Get Your N8N Webhook URL

1. In N8N, open your workflow
2. Click on the **Webhook** node
3. Switch to the **Production** tab (not Test)
4. Copy the **Production URL**:
   ```
   https://your-name.app.n8n.cloud/webhook/whatsapp-notify
   ```

### Step 6.2: Update Your `.env.local`

Open `c:\Users\kamal\OneDrive\Desktop\AIsubmit\.env.local` and replace the placeholder:

```env
# N8N Webhook URL for WhatsApp notifications
# Replace with your actual N8N webhook endpoint
N8N_WEBHOOK_URL=https://your-name.app.n8n.cloud/webhook/whatsapp-notify
```

### Step 6.3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C), then:
npm run dev
```

The new environment variable will be loaded.

### Step 6.4: Verify the Connection

1. Open your browser → `http://localhost:3000/admin`
2. Log in with staff credentials
3. Click the green **"WhatsApp Mass Notifications"** card
4. You should see the notifications page with:
   - Recipient stats bar (Total / With Phone / Without Phone)
   - Template selector grid (6 templates)
   - Filter dropdowns

---

## 7. Phase 6: Testing the Full Pipeline

### Test 1: Webhook Connectivity (Using webhook.site)

Before connecting N8N, verify your dashboard sends correct data:

1. Go to [https://webhook.site](https://webhook.site)
2. Copy the unique URL (e.g., `https://webhook.site/abc-123-def`)
3. Temporarily set this as your `N8N_WEBHOOK_URL` in `.env.local`
4. Restart dev server
5. Go to `/admin/notifications`
6. Select **📢 General Announcement** template
7. Type a test message in the custom message field
8. Click **Send WhatsApp Blast**
9. Check webhook.site — you should see the full JSON payload:

```json
{
  "recipients": [
    {
      "phone": "+919876543210",
      "name": "Test User",
      "university": "Test University"
    }
  ],
  "message": "📢 AI Submit 2026 Update: This is a test message",
  "templateSlug": "general_announcement",
  "templateName": "📢 General Announcement",
  "sentAt": "2026-07-17T09:30:00.000Z",
  "totalRecipients": 1
}
```

✅ If you see this payload, your dashboard is correctly sending data.

### Test 2: N8N Webhook Reception

1. Set `N8N_WEBHOOK_URL` back to your actual N8N URL
2. In N8N, open your workflow → click the Webhook node → click **Listen for Test Event**
3. From the dashboard, send a test blast
4. N8N should capture the event and show the payload
5. Click **Execute Workflow** to test the full flow

### Test 3: WhatsApp Delivery

1. Ensure your own phone number is in the Supabase `profiles` table
2. Make sure your number is added as a test recipient in Meta Business (Step 4A.5)
3. Send a test blast from the dashboard
4. Check your WhatsApp for the message

### Test 4: Verify Campaign Logging

1. After sending a test blast, switch to the **History** tab in `/admin/notifications`
2. You should see your campaign logged with:
   - Template name
   - Message preview
   - Recipient count
   - Status (sent/failed)
   - Timestamp

You can also verify in Supabase:
```sql
select * from public.notification_logs order by sent_at desc limit 5;
```

---

## 8. Appendix: Troubleshooting & FAQ

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| **"N8N Webhook URL is not configured"** | `.env.local` missing `N8N_WEBHOOK_URL` | Add the URL and restart dev server |
| **"No recipients with phone numbers"** | Profiles don't have phone data | Check `profiles` table in Supabase |
| **Webhook returns 404** | Wrong N8N URL or workflow not active | Verify URL, ensure workflow is toggled Active |
| **Webhook returns 500** | N8N workflow has errors | Check N8N execution logs for details |
| **WhatsApp message not received** | Phone format wrong, or not in test contacts | Ensure format is `+CountryCode Number` (e.g., `+919876543210`) |
| **"Template not approved"** | WhatsApp template pending review | Wait for Meta approval (1-24 hours) |
| **Rate limit error (429)** | Sending too fast | Increase Wait node to 2-3 seconds |
| **Messages sent but show single tick** | Recipient phone not on WhatsApp | Verify the phone number has WhatsApp |

### Phone Number Format Requirements

WhatsApp requires phone numbers in E.164 international format:

| Format | Valid? | Example |
|--------|--------|---------|
| `+919876543210` | ✅ Yes | Indian number with country code |
| `919876543210` | ✅ Yes | Without + prefix (API accepts this) |
| `09876543210` | ❌ No | Local format, missing country code |
| `9876543210` | ❌ No | No country code |
| `+91 98765 43210` | ⚠️ Maybe | Spaces — the Code node strips these |

> **Best Practice**: Store phone numbers as `+919876543210` in your Supabase `profiles` table.

### Security Recommendations

#### Add Webhook Authentication

1. **In N8N**: Edit the Webhook node → Set **Authentication** to `Header Auth`
   - **Header Name**: `X-Webhook-Secret`
   - **Header Value**: Choose a strong secret (e.g., `sk_wa_7f3a8b2c1d9e4f5a`)

2. **In `.env.local`**: Add:
   ```
   N8N_WEBHOOK_SECRET=sk_wa_7f3a8b2c1d9e4f5a
   ```

3. **In `notifications.ts` server action**: Add the header to the fetch call:
   ```typescript
   const webhookResponse = await fetch(webhookUrl, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
     },
     body: JSON.stringify(payload),
   });
   ```

### WhatsApp Messaging Limits

| Tier | Daily Limit | How to Qualify |
|------|-------------|---------------|
| **Unverified** | 250 messages/day | Default for new accounts |
| **Tier 1** | 1,000 messages/day | Verify your Meta Business account |
| **Tier 2** | 10,000 messages/day | Maintain quality rating > Medium |
| **Tier 3** | 100,000 messages/day | Maintain quality rating > Medium for 7 days |

### Cost Breakdown (Meta WhatsApp Cloud API)

| Conversation Type | Cost (India) | Triggered When |
|---|---|---|
| **Utility** (reminders, updates) | ₹0.35 per conversation | You send the first message |
| **Marketing** (promotions) | ₹0.77 per conversation | You send promotional content |
| **Service** (customer support) | Free | User messages you first |

> The first 1,000 service conversations per month are free. Business-initiated conversations are charged per the table above.

### FAQ

**Q: Can I send messages to people who haven't opted in?**
A: WhatsApp requires opt-in consent. Since attendees registered for your event and provided phone numbers, this is considered implicit opt-in for event-related communications. However, avoid sending marketing/promotional content without explicit consent.

**Q: What happens if the N8N webhook is down?**
A: The server action will log the campaign as `failed` in the `notification_logs` table. The admin will see an error message on the dashboard. No messages will be sent.

**Q: Can I schedule messages for later?**
A: Currently, the system supports "send now" only. For scheduled sending, you can add a **Schedule Trigger** node in N8N that queries Supabase for pending campaigns at specific times.

**Q: How do I send personalized messages (e.g., with attendee name)?**
A: The `🎉 Event Day Welcome` template already supports `{{attendee_name}}`. The N8N workflow can replace this per-recipient using the `name` field from the payload. Add a **Code** node before the WhatsApp node to personalize:
```javascript
const item = $input.first().json;
return [{
  json: {
    ...item,
    message: item.message.replace('{{attendee_name}}', item.name)
  }
}];
```

**Q: Can I send images or documents via WhatsApp?**
A: Yes, but requires modifying the WhatsApp node to use `type: "image"` or `type: "document"` instead of `type: "text"`. This would need an additional file URL parameter in the webhook payload.
