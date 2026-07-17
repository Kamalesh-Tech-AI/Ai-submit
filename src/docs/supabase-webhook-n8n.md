# ⚡ Supabase Database Webhook & Edge Function Integration with N8N

This guide explains how to set up the automation where Next.js inserts a notification record into Supabase, which automatically triggers N8N via **Supabase Database Webhooks** or **Edge Functions** to process and send the WhatsApp messages.

---

## 1. Architecture Flow

```
┌─────────────────┐      INSERT Row      ┌──────────────────┐
│ Admin Dashboard │ ───────────────────> │  Supabase Table  │
│ (Next.js UI)    │                      │  (notification_  │
└─────────────────┘                      │   logs)          │
                                         └────────┬─────────┘
                                                  │
                                                  │ Database Webhook
                                                  │ (On INSERT)
                                                  ▼
┌─────────────────┐      Sends SMS       ┌──────────────────┐
│ WhatsApp        │ ◄─────────────────── │   N8N Workflow   │
│ Cloud API       │                      │                  │
└─────────────────┘                      └──────────────────┘
```

---

## 2. Setting Up the Supabase Database Webhook

Supabase can send an HTTP POST request to N8N automatically whenever a row is inserted into your tables.

### Step 1: Get your N8N Webhook URL
Open your N8N workflow, click on the **Webhook Trigger** node, and copy the **Production URL**.
* Example: `https://your-name.app.n8n.cloud/webhook/whatsapp-notify`

### Step 2: Configure the Webhook in Supabase
1. Go to your **Supabase Dashboard**.
2. Select your project.
3. In the left sidebar, navigate to **Integrations** (or **Database** → **Webhooks** depending on your Supabase version).
4. Click **Create Webhook**.
5. Configure the webhook with these settings:

| Field | Value |
|---|---|
| **Name** | `trigger_whatsapp_n8n` |
| **Table** | `notification_logs` |
| **Events** | Check **`Insert`** only |
| **Method** | `POST` |
| **URL** | Paste your N8N Webhook URL |
| **HTTP Headers** | Add `Content-Type: application/json` |

6. Click **Save**.

---

## 3. N8N Workflow Adjustments for Supabase Webhook

When Supabase triggers a database webhook, the JSON payload format is wrapped inside a metadata structure. 

### Webhook Payload Example from Supabase
```json
{
  "type": "INSERT",
  "table": "notification_logs",
  "schema": "public",
  "record": {
    "id": "7fa32c8e-287c-482a-a92c-8d19a28e9321",
    "template_name": "⏰ Time Reminder",
    "message_sent": "🕐 Reminder: AI Submit 2026 starts in 24 hours!",
    "filter_criteria": {
      "attendeeType": "student",
      "checkedIn": "all",
      "university": "SRM University"
    },
    "status": "pending"
  },
  "old_record": null
}
```

### How to configure N8N to handle this payload:

#### Node 1: Webhook Trigger
Keep it listening on `POST` to `/whatsapp-notify`.

#### Node 2: Supabase (Fetch Recipients)
Instead of sending recipient numbers directly from Next.js, N8N can query the database itself based on the filters inside `record.filter_criteria`:

1. Add a **Supabase** node after the Webhook.
2. Set **Resource** to `Row` and **Operation** to `Get Many`.
3. Set **Table** to `profiles`.
4. Add **Filters** based on the criteria received in `{{ $json.body.record.filter_criteria }}`:
   - If `attendeeType` is not `'all'`, filter where `attendee_type` equals `{{ $json.body.record.filter_criteria.attendeeType }}`.
   - If `university` is not `'all'`, filter where `university` equals `{{ $json.body.record.filter_criteria.university }}`.

#### Node 3: Loop & Send
Loop through the profiles returned, format the phone numbers, and send them to the WhatsApp API node.

#### Node 4: Supabase (Update Log Status)
Once all messages are sent, update the original `notification_logs` row to `sent`:
1. Add a **Supabase** node at the end of the workflow.
2. Set **Operation** to `Update`.
3. Set **Table** to `notification_logs`.
4. **Row ID**: `{{ $json.body.record.id }}`.
5. **Fields to Update**:
   - `status`: `sent`

---

## 4. Alternative: Supabase Edge Function

If you want to use a TypeScript Edge Function inside Supabase to handle the dispatch logic:

### Step 1: Create the Edge Function
Run the Supabase CLI in your terminal:
```bash
supabase functions new whatsapp-sender
```

### Step 2: Write the Edge Function Code (`index.ts`)
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record } = await req.json()
  
  // 1. Fetch N8N webhook URL from Environment Variables
  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL")
  
  // 2. Forward the data to N8N
  const response = await fetch(n8nUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: record.message_sent,
      filters: record.filter_criteria,
      logId: record.id
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### Step 3: Deploy the Edge Function
```bash
supabase secrets set N8N_WEBHOOK_URL=https://your-n8n-url.com/webhook/whatsapp-notify
supabase functions deploy whatsapp-sender
```

### Step 4: Add Webhook to Edge Function
In your Supabase Dashboard, create a Database Webhook on `Insert` of `notification_logs`, but choose **Supabase Edge Function** as the destination instead of an HTTP URL, and select `whatsapp-sender`.
