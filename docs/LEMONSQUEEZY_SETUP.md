# LemonSqueezy Payment Integration Setup Guide

This guide will walk you through setting up LemonSqueezy payment integration for Taktak.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [LemonSqueezy Account Setup](#lemonsqueezy-account-setup)
3. [Create Products](#create-products)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Setup Webhooks](#setup-webhooks)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- LemonSqueezy account (sign up at https://lemonsqueezy.com)
- Taktak server running locally or deployed
- Access to your server's environment variables

---

## LemonSqueezy Account Setup

### 1. Create a LemonSqueezy Account

1. Go to https://lemonsqueezy.com
2. Sign up for an account
3. Complete the onboarding process
4. Create a store (if you haven't already)

### 2. Get Your API Key

1. Go to **Settings** → **API**
2. Click **Create API Key**
3. Give it a name (e.g., "Taktak Production")
4. Copy the API key (you won't be able to see it again!)
5. Save it securely

### 3. Get Your Store ID

1. Go to **Settings** → **Stores**
2. Click on your store
3. The Store ID is in the URL: `https://app.lemonsqueezy.com/settings/stores/{STORE_ID}`
4. Copy the Store ID

---

## Create Products

### 1. Create Desktop License Product

1. Go to **Products** → **New Product**
2. Fill in the details:
   - **Name**: Taktak Desktop
   - **Description**: One-time purchase for desktop application with offline-first capabilities
   - **Price**: $29.00 USD
   - **Type**: One-time payment
3. Click **Create Product**
4. Go to the product page and copy the **Variant ID** from the URL or product details

### 2. Create Cloud Sync Subscription Product

1. Go to **Products** → **New Product**
2. Fill in the details:
   - **Name**: Taktak Cloud Sync
   - **Description**: Monthly subscription for cloud backup and multi-device sync
   - **Price**: $5.00 - $9.00 USD (you can create multiple variants)
   - **Type**: Subscription
   - **Billing Interval**: Monthly
3. Click **Create Product**
4. Go to the product page and copy the **Variant ID**

---

## Configure Environment Variables

### 1. Update `.env` File

Copy the `.env.example` file to `.env` and fill in the LemonSqueezy configuration:

```bash
# ============================================
# LEMONSQUEEZY PAYMENT CONFIGURATION
# ============================================
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
LEMONSQUEEZY_WEBHOOK_URL=https://yourdomain.com/api/lemonsqueezy/webhook

# Product Variant IDs
LEMONSQUEEZY_DESKTOP_VARIANT_ID=your_desktop_variant_id
LEMONSQUEEZY_CLOUD_SYNC_VARIANT_ID=your_cloud_sync_variant_id
```

### 2. Environment Variable Details

- **LEMONSQUEEZY_API_KEY**: Your API key from Step 2 above
- **LEMONSQUEEZY_STORE_ID**: Your Store ID from Step 3 above
- **LEMONSQUEEZY_WEBHOOK_SECRET**: Generate a random secret (see below)
- **LEMONSQUEEZY_WEBHOOK_URL**: Your public webhook URL (see Webhooks section)
- **LEMONSQUEEZY_DESKTOP_VARIANT_ID**: Variant ID from Desktop product
- **LEMONSQUEEZY_CLOUD_SYNC_VARIANT_ID**: Variant ID from Cloud Sync product

### 3. Generate Webhook Secret

Generate a secure random string for your webhook secret:

```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use any random string generator
```

---

## Setup Webhooks

### 1. Expose Your Local Server (for testing)

If you're testing locally, you need to expose your server to the internet. Use one of these tools:

**Option A: ngrok (Recommended)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Option B: localtunnel**
```bash
npm install -g localtunnel
lt --port 3001

# Copy the URL
```

### 2. Configure Webhook in LemonSqueezy

1. Go to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Fill in the details:
   - **URL**: `https://yourdomain.com/api/lemonsqueezy/webhook` (or your ngrok URL)
   - **Secret**: The webhook secret you generated above
   - **Events**: Select the following events:
     - `order_created`
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
     - `subscription_payment_success`
     - `subscription_payment_failed`
4. Click **Create Webhook**

### 3. Test Webhook

LemonSqueezy provides a webhook testing tool:

1. Go to your webhook settings
2. Click **Send Test Event**
3. Select an event type (e.g., `order_created`)
4. Check your server logs to verify the webhook was received

---

## Testing

### 1. Test Mode

LemonSqueezy provides a test mode for testing payments without real money:

1. Go to **Settings** → **General**
2. Enable **Test Mode**
3. Use test card numbers provided by LemonSqueezy

### 2. Test Checkout Flow

1. Start your Taktak server:
   ```bash
   npm run dev
   ```

2. Navigate to the pricing page:
   ```
   http://localhost:3000/pricing
   ```

3. Click **Get Started** on either plan

4. You should be redirected to LemonSqueezy checkout

5. Complete the test purchase

6. Check your server logs for webhook events

7. Verify the license was created in your database

### 3. Verify Database

Check that the subscription and license were created:

```bash
# Check subscriptions database
curl http://localhost:3001/api/lemonsqueezy/subscriptions

# Check licenses (if you have an endpoint)
# Or check PouchDB directly
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL**: Make sure it's publicly accessible
2. **Check webhook secret**: Verify it matches in both LemonSqueezy and your `.env`
3. **Check server logs**: Look for webhook processing errors
4. **Test with ngrok**: Use ngrok to expose your local server
5. **Check firewall**: Ensure your server allows incoming requests

### Checkout Not Working

1. **Check API key**: Verify it's correct and has the right permissions
2. **Check variant IDs**: Ensure they match your products in LemonSqueezy
3. **Check authentication**: Make sure the user is logged in
4. **Check browser console**: Look for JavaScript errors
5. **Check server logs**: Look for API errors

### License Not Generated

1. **Check webhook events**: Verify `order_created` or `subscription_created` was received
2. **Check custom data**: Ensure `user_id` and `product_type` are being passed
3. **Check license service**: Verify the license service is working correctly
4. **Check database**: Ensure PouchDB is initialized and writable

### Common Errors

**Error: "Missing signature"**
- The webhook request doesn't have the `X-Signature` header
- Check that LemonSqueezy is sending the signature

**Error: "Invalid signature"**
- The webhook secret doesn't match
- Verify the secret in both LemonSqueezy and your `.env`

**Error: "Failed to create checkout session"**
- Check your API key and store ID
- Verify the variant ID exists
- Check LemonSqueezy API status

---

## Production Deployment

### 1. Update Environment Variables

Update your production environment variables with:
- Production API key
- Production webhook URL (your actual domain)
- Production webhook secret

### 2. Disable Test Mode

1. Go to **Settings** → **General**
2. Disable **Test Mode**
3. Verify all products are published

### 3. Update Webhook URL

1. Go to **Settings** → **Webhooks**
2. Update the webhook URL to your production domain
3. Test the webhook with a real purchase

### 4. Monitor

- Set up logging and monitoring for webhook events
- Monitor failed payments and subscription cancellations
- Set up alerts for critical errors

---

## Additional Resources

- [LemonSqueezy Documentation](https://docs.lemonsqueezy.com)
- [LemonSqueezy API Reference](https://docs.lemonsqueezy.com/api)
- [LemonSqueezy Webhooks Guide](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks)
- [LemonSqueezy Test Mode](https://docs.lemonsqueezy.com/guides/developer-guide/testing)

---

## Support

If you encounter any issues:

1. Check the [LemonSqueezy Status Page](https://status.lemonsqueezy.com)
2. Review the [LemonSqueezy Community](https://community.lemonsqueezy.com)
3. Contact LemonSqueezy Support
4. Check Taktak GitHub Issues

---

**Last Updated**: 2025-01-07

