# Zeptomail Integration Setup Guide

This guide explains how to set up Zeptomail for the contact form on your website.

## Step 1: Create a Zeptomail Account

1. Go to [https://www.zeptomail.com/](https://www.zeptomail.com/)
2. Sign up for an account (free tier available)
3. Verify your email address

## Step 2: Get Your API Credentials

1. Log in to your Zeptomail dashboard
2. Go to **Settings** → **SMTP & API**
3. Find your **API Token** (it will be in the format: `Zoho-enczapikey xxxxxx`)
4. Copy the token (you'll need just the token part, not the "Zoho-enczapikey" prefix)

## Step 3: Verify Your Sender Email (Bounce Address)

1. In Zeptomail dashboard, go to **Settings** → **Bounce Address**
2. Add and verify the email address you want to use as the sender
   - This is the email that will appear in the "From" field
   - Example: `noreply@yourdomain.com` or `contact@yourdomain.com`
3. Verify the email by clicking the verification link sent to that email

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the `dxi_website` folder (if it doesn't exist)
2. Add the following variables:

```env
# Zeptomail API Token (just the token, without "Zoho-enczapikey" prefix)
ZEPTOMAIL_TOKEN=your-actual-token-here

# Your verified bounce address
ZEPTOMAIL_BOUNCE_ADDRESS=noreply@yourdomain.com

# Email where contact form submissions will be sent
CONTACT_FORM_RECIPIENT_EMAIL=contact@yourdomain.com
```

**Important:**
- Replace `your-actual-token-here` with your actual Zeptomail API token
- Replace `noreply@yourdomain.com` with your verified bounce address
- Replace `contact@yourdomain.com` with the email where you want to receive contact form submissions

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the contact page: `http://localhost:3000/contact-us`
3. Fill out and submit the form
4. Check your email inbox for the submission
5. The user should also receive a confirmation email

## Production Setup

When deploying to production (Vercel, Netlify, etc.):

1. Go to your hosting platform's environment variables settings
2. Add the same environment variables:
   - `ZEPTOMAIL_TOKEN`
   - `ZEPTOMAIL_BOUNCE_ADDRESS`
   - `CONTACT_FORM_RECIPIENT_EMAIL`
3. Redeploy your application

## Troubleshooting

### Email not sending
- Check that all environment variables are set correctly
- Verify your bounce address is verified in Zeptomail
- Check the browser console and server logs for error messages
- Ensure your API token is correct and active

### 401 Unauthorized Error
- Verify your API token is correct
- Make sure you're using just the token, not the full "Zoho-enczapikey xxxxxx" format

### 400 Bad Request Error
- Check that your bounce address is verified
- Ensure the recipient email is valid

### File Attachments Not Working
- Zeptomail supports attachments up to 10MB
- Ensure the file type is allowed (PDF, DOC, DOCX, TXT)

## API Rate Limits

Zeptomail free tier includes:
- 10,000 emails per month
- 100 emails per day

For higher limits, upgrade your plan in the Zeptomail dashboard.

## Security Notes

- Never commit `.env.local` to version control
- Keep your API token secure
- Use environment variables for all sensitive data
- The API route is server-side only, so your token is never exposed to the client

