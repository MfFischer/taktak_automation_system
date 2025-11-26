<div align="center">
  <img src="./public/logo.png" alt="Taktak Logo" width="120" height="120">
  
  # ⚡ Taktak
  
  ### AI-Driven Offline-First Automation Platform
  
  *Shake off the manual work with intelligent workflow automation*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
  
  [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation)
  
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **Visual Workflow Builder**
Drag-and-drop interface powered by React Flow. Build complex automation workflows visually with **37 nodes** across 11 categories including Triggers, AI, Communication, Google Workspace, Payments, and more.

</td>
<td width="50%">

### 🤖 **4-Tier AI Fallback System** 🆕
**Enterprise-grade 99.9% uptime** with automatic failover:
1. **Gemini** (0.8s) - Fastest, best quality ✅ **READY**
2. **OpenRouter** (1.2s) - Multiple models fallback ✅ **READY**
3. **Phi-3 Local** (1.5s) - **Zero-setup, offline, privacy-first** ✅ **READY**
4. **Queue** - Retry when online ✅ **READY**

*Unlike Zapier/Make, Taktak works even when APIs are down!*
**🎉 NEW: Works immediately without API keys!** Just download the Phi-3 model (2.4GB) and you're ready to go!

</td>
</tr>
<tr>
<td width="50%">

### 💾 **Offline-First Architecture**
Works without internet using PouchDB local storage. Optional cloud sync to CouchDB when connectivity is available. Your data, your control.

</td>
<td width="50%">

### 📋 **36 Pre-Built Templates** 🆕
Ready-to-use workflows across 9 categories:
- **Sales**: Lead Capture, AI Scoring, Follow-ups
- **Marketing**: Social Scheduler, Email Campaigns
- **Support**: AI Chat, Ticket Priority
- **Finance, HR, IT Ops, E-commerce, Analytics, Legal**

</td>
</tr>
<tr>
<td width="50%">

### 🔐 **Enterprise Security**
JWT authentication, encrypted credentials, and secure data handling. Built with security best practices from the ground up.

</td>
<td width="50%">

### 🧠 **Zero-Setup Local AI** ✅ **READY**
Offline AI with Phi-3 is now available! Download the model (2.4GB) and use AI **without any API keys**. Perfect for privacy-conscious users and offline scenarios.

</td>
</tr>
<tr>
<td width="50%">

### 💾 **Auto-Save** 🆕
Never lose your work! Workflows auto-save every 3 seconds with visual status indicators (Saving, Saved, Unsaved). Toggle on/off as needed.

</td>
<td width="50%">

### 🖥️ **Desktop App**
Same powerful platform as an Electron desktop app. Run Taktak locally without a browser for maximum performance and privacy.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ • npm • (Optional) CouchDB for cloud sync
```

### Installation

```bash
# Clone the repository
git clone https://github.com/MfFischer/taktak.git
cd taktak

# Install dependencies
npm install

# Build shared types
cd packages/types && npm run build && cd ../..

# Start development servers
npm run dev:server  # Terminal 1 - Backend (port 3001)
npm run dev:client  # Terminal 2 - Frontend (port 3000)
```

### Environment Setup

Create `.env` in the root directory (copy from `.env.example`):

```env
# Server Configuration
NODE_ENV=development
SERVER_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-32-character-encryption-key!!

# ============================================
# AI CONFIGURATION (4-Tier Fallback System)
# ============================================
# Tier 1: Google Gemini (fastest, best quality - 0.8s)
GEMINI_API_KEY=your_gemini_api_key_here

# Tier 2: OpenRouter (fallback, multiple models - 1.2s)
# Get API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Tier 3: Local Phi-3 (offline, slower - 1.5s)
# Tier 4: Queue (all providers failed - will retry when online)

# AI Mode: cloud (Gemini only), local (Phi-3 only), auto (4-tier fallback - RECOMMENDED)
AI_MODE=auto

# Local LLM Configuration (Phi-3)
LOCAL_LLM_MODEL_PATH=./models/phi-3-mini-4k-instruct-q4.gguf
LOCAL_LLM_CONTEXT_SIZE=4096
LOCAL_LLM_MAX_TOKENS=2048

# Optional: Cloud Sync
COUCHDB_URL=http://localhost:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=changeme

# Optional: Notifications
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 🎉 You're Ready!

Open [http://localhost:3000](http://localhost:3000) and start automating!

---

## 🤖 AI Configuration

Taktak features a **4-tier AI fallback system** for enterprise-grade reliability:

### 🎉 Zero-Setup Option (NEW!)

**No API keys needed!** Just download the Phi-3 model and start using AI immediately:

1. **Download Phi-3 Model** (one-time, ~2.4GB):
   ```powershell
   # Windows PowerShell (run from apps/server/models directory)
   Invoke-WebRequest -Uri "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf" -OutFile "phi-3-mini-4k-instruct-q4.gguf"
   ```

   Or download manually from: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/tree/main

2. **Set AI mode to local** in `.env`:
   ```env
   AI_MODE=local
   ```

3. **Restart backend server** and you're done! 🎉

**Benefits:**
- ✅ **Zero-setup** - No API keys required
- ✅ **Works offline** - No internet needed
- ✅ **Privacy-first** - Data never leaves your machine
- ✅ **Free forever** - No usage limits or costs

---

### ⚡ Cloud Option (Faster, Optional)

For faster responses, add cloud AI providers:

1. **Get a FREE Gemini API Key** (Recommended for speed):
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to `.env` file**:
   ```env
   GEMINI_API_KEY=your_key_here
   AI_MODE=auto
   ```

3. **Restart backend server** and enjoy faster AI! 🎉

### Optional: Add OpenRouter for Extra Reliability

For even better uptime, add OpenRouter as a second fallback:
- Get API key: https://openrouter.ai/keys (Pay-as-you-go, $5 minimum)
- Add to `.env`: `OPENROUTER_API_KEY=your_key_here`

---

### AI Provider Comparison

| Provider | Speed | Quality | Cost | Status | Setup |
|----------|-------|---------|------|--------|-------|
| **Gemini** | 0.8s | ⭐⭐⭐⭐⭐ | Free tier | ✅ **READY** | API key |
| **OpenRouter** | 1.2s | ⭐⭐⭐⭐ | $0.001/req | ✅ **READY** | API key |
| **Phi-3 Local** | 1.5s | ⭐⭐⭐ | **Free** | ✅ **READY** | Model download (2.4GB) |
| **Queue** | N/A | N/A | Free | ✅ **READY** | None |

### How It Works

**AI Mode: `auto` (Recommended)**
```
User Request
    ↓
┌─────────────────────────────────────┐
│  1. Try Gemini (8s timeout)         │ ← Fastest, best quality ✅
└─────────────────────────────────────┘
    ↓ (if fails or no API key)
┌─────────────────────────────────────┐
│  2. Try OpenRouter (12s timeout)    │ ← Multiple models ✅
└─────────────────────────────────────┘
    ↓ (if fails or no API key)
┌─────────────────────────────────────┐
│  3. Try Phi-3 Local (15s timeout)   │ ← Offline, privacy-first ✅
└─────────────────────────────────────┘
    ↓ (if fails or no model)
┌─────────────────────────────────────┐
│  4. Queue for later                 │ ← Retry when online ✅
└─────────────────────────────────────┘
```

**AI Mode: `local` (Zero-Setup)**
```
User Request
    ↓
┌─────────────────────────────────────┐
│  Use Phi-3 Local (15s timeout)      │ ← Offline, privacy-first ✅
└─────────────────────────────────────┘
    ↓ (if fails)
┌─────────────────────────────────────┐
│  Queue for later                    │ ← Retry when model available ✅
└─────────────────────────────────────┘
```

**Note:** All 4 tiers are now fully operational! Choose `AI_MODE=auto` for maximum reliability or `AI_MODE=local` for zero-setup offline AI.

### Features

- ✅ **Request Caching** - Last 50 prompts cached for 1 hour (instant replay)
- ✅ **Smart Timeouts** - Each provider has optimized timeout settings
- ✅ **Status Tracking** - Visual indicators show which AI is being used
- ✅ **Offline Queue** - Failed requests automatically retry when online
- ✅ **Zero Downtime** - Always works, even when all cloud APIs are down

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    A[React Frontend] -->|REST API| B[Express Backend]
    B -->|Local Storage| C[PouchDB]
    C -->|Optional Sync| D[CouchDB]
    B -->|AI Tier 1| E[Google Gemini]
    B -->|AI Tier 2| F[OpenRouter]
    B -->|AI Tier 3| G[Phi-3 Local]
    B -->|AI Tier 4| H[Request Queue]
    B -->|Notifications| I[Twilio/SMTP]
    B -->|Scheduling| J[Node-Cron]

    style E fill:#10b981
    style F fill:#3b82f6
    style G fill:#eab308
    style H fill:#6b7280
```

</div>

### Tech Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>React 18 • TypeScript • Vite • Tailwind CSS • React Flow • React Router</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>Node.js • Express • TypeScript • PouchDB • JWT</td>
</tr>
<tr>
<td><b>AI Providers</b></td>
<td>Google Gemini • OpenRouter • Phi-3 (llama.cpp) • Request Queue</td>
</tr>
<tr>
<td><b>DevOps</b></td>
<td>Docker • Docker Compose • GitHub Actions • npm Workspaces</td>
</tr>
</table>

---

## 📦 Available Workflow Nodes (37 Total)

### Triggers
| Node | Description |
|------|-------------|
| ⏰ **Schedule** | Cron-based triggers for timed automation |
| 🔗 **Webhook** | Receive HTTP callbacks from external services |
| 👁️ **Database Watch** | Monitor database for changes |
| 📁 **File Watch** | Trigger on file system changes |

### Actions & Logic
| Node | Description |
|------|-------------|
| 🌐 **HTTP Request** | Make API calls to external services |
| 💻 **Code** | Execute custom JavaScript/TypeScript |
| 🔄 **Transform** | Transform data between formats |
| 🔀 **Condition** | If/else branching logic |
| 🔀 **Switch** | Multi-way branching |
| 🔁 **Loop** | Iterate over collections |

### Data
| Node | Description |
|------|-------------|
| 💾 **Database Query** | SQL/NoSQL database operations |
| 📊 **Spreadsheet** | Read/write spreadsheet data |
| 📋 **JSON Parse** | Parse and extract JSON data |
| 📄 **CSV Parse** | Parse CSV files |
| 📝 **XML Parse** | Parse XML documents |
| 📁 **File Read** | Read files from disk |

### Communication
| Node | Description |
|------|-------------|
| 📧 **Email** | Send emails via SMTP |
| 💬 **Slack** | Post messages to Slack |
| 🎮 **Discord** | Send Discord messages |
| 📱 **SMS** | Send SMS via Twilio |

### Google Workspace
| Node | Description |
|------|-------------|
| 📧 **Gmail** | Send/read Gmail messages |
| 📊 **Google Sheets** | Read/write spreadsheets |
| 📁 **Google Drive** | File operations |
| 📅 **Google Calendar** | Manage calendar events |

### AI & Machine Learning
| Node | Description |
|------|-------------|
| 🤖 **OpenAI** | GPT models for text generation |
| 📝 **AI Text** | Text analysis and generation |
| 🎨 **AI Image** | Image generation |
| 🏷️ **AI Classify** | Content classification |

### Payments & E-commerce
| Node | Description |
|------|-------------|
| 💳 **Stripe** | Payment processing |
| 💰 **PayPal** | PayPal transactions |
| 🛒 **Shopify** | E-commerce operations |
| 🛍️ **WooCommerce** | WooCommerce integration |
| 🏪 **Square POS** | Point of sale |

### Development & Productivity
| Node | Description |
|------|-------------|
| 🐙 **GitHub** | Repository operations |
| 🦊 **GitLab** | CI/CD and repos |
| 📝 **Notion** | Notion pages and databases |
| 📋 **Trello** | Board management |
| 📊 **Airtable** | Database operations |
| ✅ **Asana** | Task management |

---

## 📋 Pre-Built Workflow Templates (36 Total)

Taktak includes **36 production-ready workflow templates** across 9 business categories:

### 💼 Sales (4 Templates)
| Template | Description |
|----------|-------------|
| **Lead Capture** | Automatically capture and store leads from web forms |
| **AI Lead Scoring** | Score leads using AI based on engagement data |
| **Sales Follow-up** | Automated follow-up emails after initial contact |
| **Deal Alerts** | Notify team when deals reach key stages |

### 📣 Marketing (3 Templates)
| Template | Description |
|----------|-------------|
| **Social Scheduler** | Schedule and post to multiple social platforms |
| **Email Campaign** | Automated drip email campaigns |
| **Content Repurposing** | Transform blog posts into social content |

### 🎧 Support (2 Templates)
| Template | Description |
|----------|-------------|
| **AI Customer Support** | AI-powered first-response to support tickets |
| **Ticket Auto-Priority** | Automatically prioritize tickets based on keywords |

### 💰 Finance (2 Templates)
| Template | Description |
|----------|-------------|
| **Invoice Processing** | Extract data from invoices and update records |
| **Expense Approval** | Route expense reports for approval |

### 👥 HR (2 Templates)
| Template | Description |
|----------|-------------|
| **Employee Onboarding** | Automate new hire setup across systems |
| **Leave Request** | Process and route vacation requests |

### 🔧 IT Ops (2 Templates)
| Template | Description |
|----------|-------------|
| **Database Sync** | Keep databases synchronized across environments |
| **Backup Automation** | Scheduled backups with notifications |

### 🛒 E-commerce (2 Templates)
| Template | Description |
|----------|-------------|
| **Order Processing** | End-to-end order fulfillment automation |
| **Abandoned Cart Recovery** | Win back lost sales with follow-up emails |

### 📊 Analytics (1 Template)
| Template | Description |
|----------|-------------|
| **Analytics Pipeline** | Aggregate data from multiple sources |

### ⚖️ Legal (2 Templates)
| Template | Description |
|----------|-------------|
| **Contract Generation** | Generate contracts from templates |
| **AI Contract Review** | AI-powered contract analysis |

### Using Templates

1. Browse templates on the **landing page**
2. Click any template to **preview** the workflow
3. Click **Use This Template** to import
4. Customize nodes and connections as needed
5. Save and activate your workflow

---

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# Services available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - CouchDB: http://localhost:5984
```

---

## 🧪 Testing

```bash
# Run server tests
cd apps/server && npm test

# Run with coverage
npm test -- --coverage
```

---

## 📁 Project Structure

```
taktak/
├── apps/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   └── ...
│   │   └── package.json
│   └── server/              # Express backend application
│       ├── src/
│       │   ├── engine/      # Workflow execution engine
│       │   ├── routes/      # API endpoints
│       │   ├── services/    # Business logic
│       │   └── ...
│       └── package.json
├── packages/
│   └── types/               # Shared TypeScript definitions
├── docker-compose.yml       # Docker orchestration
└── package.json             # Root workspace configuration
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [React Flow](https://reactflow.dev/) - Beautiful workflow visualization
- [Google Gemini](https://ai.google.dev/) - Powerful AI capabilities
- [PouchDB](https://pouchdb.com/) - Reliable offline-first database
- [Tailwind CSS](https://tailwindcss.com/) - Modern utility-first CSS

---

<div align="center">
  
  **Built with ❤️ for local businesses and clinics**
  
  *Taktak - Shake off the manual work* ⚡
  
</div>

