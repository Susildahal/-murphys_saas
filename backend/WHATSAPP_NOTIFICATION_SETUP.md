# WhatsApp & Email Notification System

## Overview
Automated notification system for renewal reminders via WhatsApp and Email.

## Features Implemented

### 1. **New Renewal Created**
- Sends WhatsApp + Email when a renewal is added to a service
- Includes renewal details (label, date, amount)

### 2. **Renewal Reminders** 
- Automatic reminders sent at:
  - **7 days** before renewal date
  - **3 days** before renewal date  
  - **1 day** before renewal date
- Only sent if renewal is **NOT paid** (haspaid = false)
- Scheduler runs daily at **9:00 AM**

### 3. **Renewal Payment Confirmation**
- Sends WhatsApp + Email when renewal is marked as paid
- Confirms payment received

## Environment Variables Required

Add these to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886  # Your Twilio WhatsApp number

# Email Configuration (already set)
EMAIL_FROM=your_email@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
```

## API Endpoints

### Mark Renewal as Paid
```http
PATCH /api/assigned_services/:id/renewals/:renewal_id/pay
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/assigned_services/123abc/renewals/456def/pay
```

**Response:**
```json
{
  "data": { ... },
  "message": "Renewal marked as paid and notifications sent"
}
```

## How It Works

### Renewal Creation Flow
1. Admin creates a new renewal via `PUT /api/assigned_services/:id`
2. System automatically sends WhatsApp + Email to client
3. Client receives notification with renewal details

### Reminder Schedule Flow
1. Cron job runs daily at 9:00 AM
2. Checks all unpaid renewals
3. Calculates days until renewal date
4. Sends reminder if exactly 7, 3, or 1 day away
5. Both WhatsApp and Email sent

### Payment Confirmation Flow
1. Payment is processed
2. Frontend calls `PATCH /api/assigned_services/:id/renewals/:renewal_id/pay`
3. System marks renewal as paid
4. WhatsApp + Email confirmation sent to client

## Twilio WhatsApp Setup

### Step 1: Get Twilio Account
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**

### Step 2: WhatsApp Sandbox (Testing)
For development, use Twilio's WhatsApp Sandbox:
- Sandbox number: `+1 415 523 8886` (or your region's number)
- Join sandbox by sending the code to the number via WhatsApp
- Use format: `whatsapp:+<your_phone_number>`

### Step 3: Production Setup
For production:
1. Request WhatsApp Business API access from Twilio
2. Complete Meta/Facebook Business verification
3. Get approved WhatsApp Business number

## Testing

### Test Renewal Creation
```bash
# Create a renewal
curl -X PUT http://localhost:5000/api/assigned_services/YOUR_SERVICE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "renewal_label": "Test Renewal",
    "renewal_date": "2026-02-15",
    "renewal_price": 100
  }'
```

### Test Payment Notification
```bash
# Mark as paid
curl -X PATCH http://localhost:5000/api/assigned_services/SERVICE_ID/renewals/RENEWAL_ID/pay
```

### Test Reminder Scheduler
The scheduler runs automatically at 9:00 AM daily. To test manually, you can temporarily modify the cron expression in `renewalScheduler.ts`:

```typescript
// Change from daily 9 AM
cron.schedule('0 9 * * *', async () => {

// To every minute (for testing)
cron.schedule('* * * * *', async () => {
```

## Phone Number Format

Client phone numbers in the database should be in international format:
- Correct: `+61 412 345 678`
- Correct: `+1 555 123 4567`
- Wrong: `0412 345 678` (missing country code)

## Troubleshooting

### WhatsApp Not Sending
1. Check Twilio credentials in `.env`
2. Verify phone number is in WhatsApp sandbox (dev) or verified (prod)
3. Check phone number format includes country code
4. View Twilio console logs for errors

### Email Not Sending
1. Verify SMTP credentials
2. Check spam folder
3. Review nodemailer configuration

### Scheduler Not Running
1. Check server logs for "Renewal reminder scheduler started"
2. Verify cron expression is correct
3. Ensure server stays running (not restarting frequently)

## Files Created/Modified

### New Files
- `backend/src/services/notificationService.ts` - WhatsApp & Email service
- `backend/src/services/renewalScheduler.ts` - Cron job scheduler
- `backend/WHATSAPP_NOTIFICATION_SETUP.md` - This documentation

### Modified Files
- `backend/src/conttrolers/assignServicec.conttlores.ts` - Added notification triggers
- `backend/src/routes/assignClient.routes.ts` - Added payment endpoint
- `backend/src/server.ts` - Start scheduler on server boot
- `backend/package.json` - Added node-cron dependency

## Production Checklist

- [ ] Set up Twilio production account
- [ ] Get WhatsApp Business API approval
- [ ] Add all environment variables to production
- [ ] Test with real phone numbers
- [ ] Set appropriate cron schedule (9 AM recommended)
- [ ] Monitor notification logs
- [ ] Set up error alerting for failed notifications

## Support

For issues, check:
- Twilio Console: https://console.twilio.com
- Server logs for notification errors
- Database for correct phone number format
