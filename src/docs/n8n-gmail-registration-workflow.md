# N8N Gmail Registration Automation Workflow — AI Summit 2026

Automated Gmail confirmation email workflow for **AI Summit 2026**. When an attendee registers on the web app, a webhook payload is dispatched to N8N, triggering an instant confirmation email containing their **D7 Auditorium Seat Number**, **QR Entrance Pass**, and **Event Details**.

---

## 1. Webhook Payload Specification

The web application sends the following JSON payload via `POST` request to `N8N_GMAIL_WEBHOOK_URL`:

```json
{
  "event": "registration_confirmed",
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-[#EXAMPLE]",
  "full_name": "Raj Krishna",
  "email": "rajkrishna@gmail.com",
  "phone": "9876543210",
  "university": "GSBT / Anna University",
  "attendee_type": "student",
  "seat_number": "E10",
  "qr_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "ticket_url": "https://ai-summit-2026.vercel.app/ticket",
  "registered_at": "2026-07-22T13:45:00.000Z"
}
```

---

## 2. N8N Gmail Node Configuration

### Node 1: Webhook Trigger
- **Webhook Path**: `ai-summit-registration-gmail`
- **HTTP Method**: `POST`
- **Respond**: `Immediately (200 OK)`

### Node 2: Gmail Node
- **Resource**: `Message`
- **Operation**: `Send`
- **To**: `={{ $json.body.email }}`
- **Subject**: `🎉 Registration Confirmed: AI Summit 2026 Entrance Pass (Seat {{ $json.body.seat_number }})`
- **Email Type**: `HTML`

---

## 3. Email Templates for N8N

### A. Gmail HTML Content (Paste into N8N Gmail Node -> HTML Body)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; color: #002060; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,32,96,0.08); border: 1px solid #d2e0ee; }
    .header { background: linear-gradient(135deg, #002060 0%, #2563eb 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; font-weight: 600; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 700; color: #002060; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #476282; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #d2e0ee; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .card-label { font-weight: 700; color: #476282; uppercase; }
    .card-value { font-weight: 700; color: #002060; }
    .seat-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-weight: 800; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin-top: 10px; }
    .cta-button { display: block; width: 80%; margin: 24px auto; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; text-align: center; padding: 14px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
    .footer { background: #f8fafc; border-t: 1px solid #d2e0ee; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI SUMMIT 2026</h1>
      <p>IITM Research Park • Chennai, India</p>
    </div>
    <div class="content">
      <div class="greeting">Hello {{ $json.body.full_name }},</div>
      <div class="intro">
        Your registration for <strong>AI Summit 2026</strong> is officially confirmed! Below are your event details and reserved seat information:
      </div>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Attendee Name:</span>
          <span class="card-value">{{ $json.body.full_name }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Institution / Org:</span>
          <span class="card-value">{{ $json.body.university }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Attendee Category:</span>
          <span class="card-value" style="text-transform: capitalize;">{{ $json.body.attendee_type }}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Venue:</span>
          <span class="card-value">IITM Research Park, Taramani</span>
        </div>
        <div style="text-align: center; margin-top: 15px;">
          <div class="seat-badge">
            💺 Auditorium D7 • Seat {{ $json.body.seat_number }}
          </div>
        </div>
      </div>

      <a href="{{ $json.body.ticket_url }}" class="cta-button" target="_blank">
        🎫 View & Download Your QR Pass
      </a>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">
        Please present your digital QR pass at the entrance registration desk for instant door verification.
      </p>
    </div>

    <div class="footer">
      © 2026 UNAI Tech Pvt. Ltd. | AI Summit 2026 Chennai<br>
      IITM Research Park, Taramani, Chennai, TN, India
    </div>
  </div>
</body>
</html>
```

---

### B. Gmail Plain Text Content (Fallback Body)

```text
AI SUMMIT 2026 — REGISTRATION CONFIRMED

Hello {{ $json.body.full_name }},

Your registration for AI Summit 2026 at IITM Research Park, Chennai is officially confirmed!

REGISTRATION DETAILS:
------------------------------------------
Name: {{ $json.body.full_name }}
Institution/Org: {{ $json.body.university }}
Category: {{ $json.body.attendee_type }}
Assigned Seat: Hall D7 - Seat {{ $json.body.seat_number }}

ACCESS YOUR ENTRANCE PASS:
View & Download QR Pass: {{ $json.body.ticket_url }}

VENUE:
IITM Research Park, Taramani, Chennai

Please present your digital QR pass at the entrance desk for check-in.

Best regards,
AI Summit 2026 Organising Team
UNAI Tech Pvt. Ltd.
```

---

## 4. N8N Ready-to-Import Workflow JSON

Copy the JSON code block below, open N8N dashboard -> **Workflows** -> **Import from JSON**, and paste:

```json
{
  "name": "AI Summit 2026 — Gmail Registration Confirmation",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "ai-summit-registration-gmail",
        "options": {}
      },
      "id": "18f4019a-9e1b-4f91-8b9a-111111111111",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        240,
        300
      ]
    },
    {
      "parameters": {
        "sendTo": "={{ $json.body.email }}",
        "subject": "🎉 Registration Confirmed: AI Summit 2026 Entrance Pass (Seat {{ $json.body.seat_number }})",
        "message": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body style=\"font-family: Arial, sans-serif; background: #f4f7fa; padding: 20px;\"><div style=\"max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #d2e0ee; padding: 24px;\"><h2 style=\"color: #002060; text-align: center;\">AI SUMMIT 2026</h2><p>Hello <strong>{{ $json.body.full_name }}</strong>,</p><p>Your registration for <strong>AI Summit 2026</strong> is confirmed!</p><div style=\"background: #f8fafc; border: 1px solid #d2e0ee; padding: 16px; border-radius: 8px;\"><p><strong>Seat:</strong> Hall D7 • Seat {{ $json.body.seat_number }}</p><p><strong>College/Org:</strong> {{ $json.body.university }}</p><p><strong>Venue:</strong> IITM Research Park, Chennai</p></div><p style=\"text-align: center; margin-top: 20px;\"><a href=\"{{ $json.body.ticket_url }}\" style=\"background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;\">View Entrance Pass</a></p></div></body></html>",
        "options": {
          "appendAttribution": false
        }
      },
      "id": "29a4029b-0f2c-5a92-9c9b-222222222222",
      "name": "Send Gmail Confirmation",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2,
      "position": [
        480,
        300
      ]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Send Gmail Confirmation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```
