# 🔄 Connecting N8N to Supabase for WhatsApp Automation

This guide explains how to connect your **N8N** instance directly to your **Supabase** database so that you can search, create, and update records whenever you receive or send a WhatsApp message.

---

## 1. Setup Supabase Credentials in N8N

To allow N8N to talk to your Supabase project:

1. Open **N8N** and go to **Credentials** (left sidebar).
2. Click **Add Credential** (top right) and search for **Supabase**.
3. Fill in the following credentials (copied from your Supabase dashboard):

| N8N Credential Field | Where to find in Supabase | Example Value |
|---|---|---|
| **Host / Project URL** | Project Settings → API → Project URL | `https://kenbkphrutpoxuplyddv.supabase.co` |
| **Service Role Secret Key** | Project Settings → API → `service_role` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> ⚠️ **Important**: Always use the **Service Role key** in N8N instead of the `anon` key. The Service Role key bypasses Row Level Security (RLS), allowing N8N to read/write records directly. Keep it secret!

---

## 2. Common Scenarios & Workflows

Below are the two most common integration flows for WhatsApp + Supabase in N8N.

### Scenario A: Look up an Attendee when they message you (WhatsApp Trigger)

When someone sends a message to your WhatsApp bot, you want to identify them by their phone number:

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  WhatsApp Trigger   │ ───> │    Supabase Node    │ ───> │  WhatsApp Out Node  │
│  (User messages us) │      │  (Lookup Profile)   │      │  (Reply to User)    │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

#### Step 1: Add a WhatsApp Trigger Node
Set the trigger to capture incoming messages. The payload will contain the sender's phone number in `from` or `wa_id` (e.g., `919342097741`).

#### Step 2: Add a Supabase Node (Read Profile)
1. Add a **Supabase** node.
2. Select your **Supabase credentials**.
3. Configure:
   - **Operation**: `Get Many` (or `Get`)
   - **Resource**: `Row`
   - **Table**: `profiles`
   - **Limit**: `1`
   - **Filters**: 
     - **Column**: `phone`
     - **Operator**: `equal`
     - **Value**: `+{{ $json.wa_id }}` (or format it to match how your database stores numbers: with/without `+`)

#### Step 3: Branch / Respond
If a profile is found, you can access their name: `{{ $json.full_name }}`. If not found, you can ask them to register.

---

### Scenario B: Auto Check-In via WhatsApp QR/Token

If an attendee replies to your reminder message with their QR token or registration ID, you can automatically check them in:

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  WhatsApp Trigger   │ ───> │    Supabase Node    │ ───> │    Supabase Node    │
│  (Sends Token/Code) │      │ (Verify Reg ID)     │      │ (Update Check-in)   │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

#### Step 1: Read the text message content
The incoming message text is usually found in `{{ $json.message.body }}`.

#### Step 2: Search for the registration
1. Add a **Supabase** node.
2. Configure:
   - **Table**: `registrations`
   - **Operation**: `Get Many`
   - **Filters**:
     - **Column**: `qr_token` (or `id`)
     - **Operator**: `equal`
     - **Value**: `{{ $json.message.body }}`

#### Step 3: Update `checked_in` to `true`
If a registration matches:
1. Add another **Supabase** node.
2. Configure:
   - **Table**: `registrations`
   - **Operation**: `Update`
   - **Row ID**: `{{ $json.id }}` (from the previous step)
   - **Fields to Update**:
     - `checked_in`: `true`
     - `checked_in_at`: `{{ new Date().toISOString() }}`

---

## 3. Alternative: Direct SQL Access (Postgres Node)

If you want to perform complex database queries (e.g., joins, aggregate statistics), you can bypass the REST API and connect N8N directly to your Supabase Postgres database:

1. In N8N, add a **Postgres** node.
2. Add credentials and fill in the connection details from Supabase **Settings → Database**:

| Postgres Credential Field | Value from Supabase |
|---|---|
| **Host** | Host URL (e.g., `aws-0-us-east-1.pooler.supabase.com`) |
| **Database** | `postgres` |
| **User** | `postgres.kenbkphrutpoxuplyddv` (project ref user) |
| **Password** | Your database password |
| **Port** | `5432` |
| **SSL** | Enabled / Check `SSL` |

3. You can now write standard SQL queries directly inside N8N:
   ```sql
   SELECT p.full_name, r.checked_in 
   FROM profiles p 
   JOIN registrations r ON r.user_id = p.id 
   WHERE p.phone = '+919342097741';
   ```
