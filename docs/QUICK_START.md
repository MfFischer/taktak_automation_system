# Taktak Quick Start Guide

Get up and running with Taktak in 5 minutes!

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for cloning)

---

## 🚀 Installation

### 1. Clone or Download the Repository

```bash
git clone https://github.com/MfFischer/taktak.git
cd taktak
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both the client and server.

---

## ⚙️ Configuration

### 1. Set Up Environment Variables

```bash
cd apps/server
cp .env.example .env
```

### 2. Edit `.env` File (Minimal Setup)

For basic functionality, you only need:

```env
# Required
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-secure-encryption-key-change-in-production

# Optional (for integrations)
OPENAI_API_KEY=your_openai_api_key
STRIPE_API_KEY=your_stripe_api_key
```

**Note**: OAuth2 integrations (Google, Slack, GitHub) require additional setup. See [OAuth2 Setup Guide](./OAUTH2_SETUP.md).

---

## 🏃 Running the Application

### Option 1: Development Mode (Recommended)

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd apps/server
npm run dev
```

**Terminal 2 - Frontend Client:**
```bash
cd apps/client
npm run dev
```

### Option 2: Single Command

From the root directory:
```bash
npm run dev
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 👤 Create Your First Account

1. Navigate to http://localhost:5173
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in your details:
   - Name
   - Email
   - Password
4. Click **"Create Account"**
5. You'll be automatically logged in and redirected to the dashboard

**Default Tier**: FREE (100 executions/month, 3 workflows)

---

## 🔧 Create Your First Workflow

### Method 1: From Template

1. Go to **Templates** page
2. Browse available templates
3. Click **"Preview"** to see the workflow
4. Click **"Use This Template"**
5. Customize and save

### Method 2: From Scratch

1. Go to **Workflows** page
2. Click **"New Workflow"**
3. Drag nodes from the left panel onto the canvas
4. Connect nodes by dragging from output to input
5. Configure each node by clicking on it
6. Click **"Save"** (Ctrl+S)
7. Click **"Execute"** (Ctrl+E) to run

---

## 🎨 Customize Your Experience

### Enable Dark Mode

1. Go to **Settings** → **Appearance**
2. Choose your theme:
   - **Light** - Always light theme
   - **Dark** - Always dark theme
   - **System** - Follow system preference

### Learn Keyboard Shortcuts

Press **Ctrl+/** to view all keyboard shortcuts:
- `Ctrl+D` - Dashboard
- `Ctrl+W` - Workflows
- `Ctrl+N` - New Workflow
- `Ctrl+T` - Templates
- `Ctrl+S` - Save Workflow
- `Ctrl+E` - Execute Workflow

---

## 🔌 Set Up Integrations

### API Key Integrations (Easy)

1. Go to **Settings** → **API Keys**
2. Add your API keys:
   - OpenAI API Key
   - Stripe API Key
   - Notion API Key
   - Airtable API Key
3. Click **"Save"**

### OAuth2 Integrations (Advanced)

For Google, Slack, and GitHub integrations:
1. Follow the [OAuth2 Setup Guide](./OAUTH2_SETUP.md)
2. Configure OAuth2 credentials in `.env`
3. Go to **Settings** → **Integrations**
4. Click **"Connect"** on the integration
5. Authorize the app

---

## 📊 Monitor Your Usage

### Dashboard

View your usage statistics:
- **Executions**: X / 100 this month
- **Workflows**: X / 3 total
- **Execution History**: 7-day chart

### Upgrade Your Plan

When you hit limits:
1. Click **"Upgrade"** button
2. Choose a plan:
   - **STARTER**: $9/month - 1,000 executions, 10 workflows
   - **PRO**: $29/month - 10,000 executions, unlimited workflows
   - **ENTERPRISE**: Custom pricing - unlimited everything

---

## 🆘 Troubleshooting

### Server Won't Start

**Error**: `Port 3000 already in use`
- **Solution**: Kill the process using port 3000 or change the port in `.env`

### Client Won't Start

**Error**: `Port 5173 already in use`
- **Solution**: Kill the process using port 5173 or change the port in `vite.config.ts`

### OAuth2 Not Working

**Error**: `Redirect URI mismatch`
- **Solution**: Ensure redirect URIs in OAuth app match exactly with `.env` file
- See [OAuth2 Setup Guide](./OAUTH2_SETUP.md) for detailed troubleshooting

### Build Errors

**Error**: TypeScript compilation errors
- **Solution**: Run `npm run build` to see detailed errors
- Ensure all dependencies are installed: `npm install`

---

## 📚 Next Steps

- Read the [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) for all features
- Check out the [OAuth2 Setup Guide](./OAUTH2_SETUP.md) for integration setup
- Explore the [GitHub Repository](https://github.com/MfFischer/taktak) for source code
- Join the community and report issues on GitHub

---

**🎉 You're all set! Start automating your workflows with Taktak!**

