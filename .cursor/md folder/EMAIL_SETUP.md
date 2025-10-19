# Email Notification Setup Guide

This guide will help you set up the email notification system using Nodemailer with Gmail SMTP (completely free).

## Prerequisites

- A Gmail account
- 2-Factor Authentication enabled on your Google Account

## Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Follow the prompts to enable it (if not already enabled)

## Step 2: Create an App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Scroll down and click on "App passwords"
4. You may need to sign in again
5. Select "Mail" from the "Select app" dropdown
6. Select "Other" from the "Select device" dropdown
7. Enter a name like "Pickleball App"
8. Click "Generate"
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Update Environment Variables

Add these variables to your `.env.local` file (create it if it doesn't exist):

```bash
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # The 16-character app password from Step 2 (remove spaces)
EMAIL_FROM=Ghost Mammoth Pickleball <your-gmail@gmail.com>
```

**Replace:**
- `your-gmail@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with your actual app password (remove the spaces)

## Step 4: Run the Database Migration

Run the SQL migration to create the email logs table:

1. Open Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/11-email-logs.sql`
4. Click "Run"

## Step 5: Test the System

1. Start your development server: `npm run dev`
2. Create an event (or use an existing one)
3. Join the queue as a regular user
4. Check your email inbox for the confirmation email

## Email Types

The system sends 4 types of emails:

1. **Queue Join** - When a user joins the queue
2. **Position Update** - When a user moves up 3+ positions
3. **Up Next** - When a user enters the top 4 positions
4. **Court Assignment** - When a user is assigned to a court

## Monitoring Email Volume

Admin users can view email statistics at:
- `/admin/email-stats`

This dashboard shows:
- Total emails sent
- Success/failure rate
- Breakdown by notification type
- SMS cost estimates based on email volume

## Gmail Limits

- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2,000 emails per day

If you exceed these limits, consider:
1. Using multiple Gmail accounts
2. Switching to a dedicated SMTP service (Sendinblue, Mailgun, etc.)
3. Upgrading to Google Workspace

## Alternative SMTP Providers (Free Tier)

If you need more than 500 emails/day:

### Sendinblue
- **Free tier**: 300 emails/day
- **Setup**: Similar to Gmail, just update the SMTP settings

### Mailgun
- **Free tier**: 100 emails/day (first month), then 100/month
- **Setup**: Sign up at mailgun.com, verify domain, update SMTP settings

### SendGrid
- **Free tier**: 100 emails/day
- **Setup**: Sign up at sendgrid.com, create API key, update SMTP settings

## Troubleshooting

### Emails not sending

1. **Check environment variables**: Make sure all EMAIL_* variables are set correctly
2. **Check app password**: Make sure you're using the app password, not your Gmail password
3. **Check logs**: Look for error messages in the console
4. **Test SMTP connection**: Try sending a test email manually

### "Less secure app access" error

- You need to use an **App Password**, not your regular Gmail password
- Make sure 2-Factor Authentication is enabled first

### Emails going to spam

- Add a proper "From" name and email
- Consider setting up SPF/DKIM records (advanced)
- Ask users to add your email to their contacts

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your environment variables are correct
3. Make sure the email logs table exists in Supabase
4. Test with a simple email first

## Cost Estimation

Use the Email Statistics dashboard (`/admin/email-stats`) to:
- Track daily/weekly/monthly email volume
- Estimate SMS costs when you're ready to integrate
- Monitor email success rate

**Typical SMS Costs:**
- Twilio: $0.0075 - $0.01 per SMS
- AWS SNS: $0.00645 per SMS
- MessageBird: $0.008 per SMS

The dashboard will automatically calculate estimated costs based on your current email volume.

