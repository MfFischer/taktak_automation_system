# OAuth2 Setup Guide

This guide will help you set up OAuth2 authentication for Google, Slack, and GitHub integrations.

## Prerequisites

- A Taktak server running locally or deployed
- Access to create OAuth applications on Google, Slack, and GitHub

---

## Google OAuth2 Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gmail API
   - Google Drive API
   - Google Calendar API
   - Google Sheets API

### 2. Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/oauth2/callback/google` (for development)
   - `https://yourdomain.com/api/oauth2/callback/google` (for production)
5. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth2/callback/google
```

---

## Slack OAuth2 Setup

### 1. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Enter app name and select workspace

### 2. Configure OAuth & Permissions

1. Go to **OAuth & Permissions**
2. Add **Redirect URLs**:
   - `http://localhost:3000/api/oauth2/callback/slack` (for development)
   - `https://yourdomain.com/api/oauth2/callback/slack` (for production)
3. Add **Bot Token Scopes**:
   - `chat:write`
   - `channels:read`
   - `users:read`
   - `files:write`

### 3. Get Credentials

1. Go to **Basic Information**
2. Copy **Client ID** and **Client Secret**

### 4. Configure Environment Variables

```env
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:3000/api/oauth2/callback/slack
```

---

## GitHub OAuth2 Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Taktak
   - **Homepage URL**: `http://localhost:5173` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/oauth2/callback/github`

### 2. Get Credentials

1. After creating the app, copy the **Client ID**
2. Generate a new **Client Secret** and copy it

### 3. Configure Environment Variables

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/oauth2/callback/github
```

---

## Testing OAuth2 Flows

### 1. Start the Server

```bash
cd apps/server
npm run dev
```

### 2. Start the Client

```bash
cd apps/client
npm run dev
```

### 3. Test Integration

1. Navigate to **Settings** → **Integrations**
2. Click **Connect** on any OAuth2 integration (Google, Slack, GitHub)
3. You'll be redirected to the provider's authorization page
4. Grant permissions
5. You'll be redirected back to Taktak with a success message

---

## Troubleshooting

### "Redirect URI mismatch" Error

- Ensure the redirect URI in your OAuth app matches exactly with the one in your `.env` file
- Check for trailing slashes
- Verify the protocol (http vs https)

### "Invalid Client" Error

- Double-check your Client ID and Client Secret
- Ensure there are no extra spaces in your `.env` file
- Regenerate credentials if necessary

### Tokens Not Refreshing

- Ensure you're requesting `offline_access` or equivalent scope
- Check that refresh tokens are being stored correctly
- Verify the token refresh logic in `oauth2Service.ts`

---

## Security Best Practices

1. **Never commit credentials** - Always use `.env` files and add them to `.gitignore`
2. **Use HTTPS in production** - OAuth2 requires secure connections
3. **Rotate secrets regularly** - Change Client Secrets periodically
4. **Limit scopes** - Only request the permissions you need
5. **Encrypt stored tokens** - Use the `ENCRYPTION_KEY` to encrypt tokens at rest

---

## Additional Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Slack OAuth Documentation](https://api.slack.com/authentication/oauth-v2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

