# Taktak

**"Shake off the manual work"**

Taktak is an AI-driven, offline-first automation platform built for local businesses and clinics that need automation but often operate offline or with limited internet access.

Unlike Zapier or Make.com, Taktak runs locally with PouchDB and automatically syncs to CouchDB when an internet connection is available. It uses Google Gemini API as a smart assistant, allowing business owners to describe tasks in natural language.

## 🌟 Key Features

- **Offline-First Architecture**: Works completely offline using PouchDB, syncs when online
- **AI-Powered Workflow Creation**: Describe workflows in natural language using Google Gemini
- **Local-First Operation**: All data stored locally, optional cloud sync
- **Business-Focused Connectors**: POS systems, SMS/email, scheduling, inventory management
- **Secure by Design**: Encrypted API keys, rate limiting, GDPR compliance features
- **Production-Ready**: Docker support, health checks, comprehensive logging

## 🎯 Target Use Cases

Perfect for small businesses like:
- **Grocery stores & pharmacies**: Stock monitoring, reorder alerts
- **Clinics**: Patient reminders, appointment scheduling
- **Printshops**: Order processing, job ticket generation
- **Lending firms**: Application processing, document management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│                  PouchDB (IndexedDB)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ Sync (bidirectional)
┌──────────────────────┴──────────────────────────────────────┐
│                    CouchDB (Cloud)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              Express API + Workflow Engine                   │
│                    BullMQ + Redis                            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PouchDB (local) + CouchDB (cloud sync)
- **Job Queue**: BullMQ with Redis
- **AI**: Google Gemini API
- **Security**: Helmet, rate limiting, encryption

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (production)
- **Logging**: Winston with daily rotation
- **Monitoring**: Health checks, metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional, recommended)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd taktak
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker (Recommended)**
```bash
npm run docker:up
```

Or **start manually**:
```bash
# Terminal 1: Start server
npm run dev:server

# Terminal 2: Start client
npm run dev:client
```

5. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- CouchDB Admin: http://localhost:5984/_utils

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Server
SERVER_PORT=3001
NODE_ENV=development

# Database
COUCHDB_URL=http://localhost:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=changeme

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key
ENCRYPTION_KEY=your_32_character_encryption_key

# External Services (Optional - can be added via UI)
GEMINI_API_KEY=your_gemini_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### API Keys

API keys can be configured in two ways:
1. **Via UI** (Recommended): Settings → API Keys
2. **Via Environment**: Set in `.env` file

Supported services:
- Google Gemini (AI features)
- Twilio (SMS)
- SMTP (Email)
- Shopify/Square (POS integration)

## 📚 Usage

### Creating a Workflow

#### Option 1: AI Assistant (Natural Language)

1. Navigate to **AI Assistant**
2. Describe your workflow:
   ```
   "Send an SMS reminder to patients every morning at 8 AM"
   ```
3. Review the generated workflow
4. Save and activate

#### Option 2: Manual Creation

1. Navigate to **Workflows** → **New Workflow**
2. Add nodes (trigger, actions, conditions)
3. Connect nodes to define flow
4. Configure each node
5. Save and activate

### Available Node Types

**Triggers**
- Schedule (cron-based)
- Webhook
- Database Watch

**Actions**
- Send SMS (Twilio)
- Send Email (SMTP)
- Database Query/Insert/Update
- HTTP Request
- CSV Import/Export

**Logic**
- Condition (if/else)
- Loop
- Delay

**AI**
- AI Generate (text generation)
- AI Parse (data extraction)

**Integrations**
- POS (Shopify, Square)
- Cloud Sync

## 🔒 Security

### Best Practices

1. **Never commit secrets**: Use `.env` file (gitignored)
2. **Change default keys**: Update `JWT_SECRET` and `ENCRYPTION_KEY` in production
3. **Use HTTPS**: Always use HTTPS in production
4. **Rate limiting**: Enabled by default (100 req/15min)
5. **API key encryption**: All API keys encrypted at rest
6. **Regular updates**: Keep dependencies updated

### GDPR Compliance

- **Data minimization**: Only collect necessary data
- **Right to erasure**: Delete workflows and executions
- **Data portability**: Export workflows as JSON
- **Consent management**: Document in privacy policy
- **Local-first**: Sensitive data can stay local-only

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production

1. **Build images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Monitor**
```bash
docker-compose logs -f
```

### Health Checks

- **Basic**: `GET /health`
- **Detailed**: `GET /health/detailed`
- **Readiness**: `GET /health/ready`
- **Liveness**: `GET /health/live`

## 📖 API Documentation

### Workflows

```bash
# List workflows
GET /api/workflows?status=active&page=1&limit=20

# Get workflow
GET /api/workflows/:id

# Create workflow
POST /api/workflows
{
  "name": "Daily Reminders",
  "description": "Send reminders every morning",
  "status": "draft",
  "nodes": [...],
  "connections": [...],
  "trigger": {...}
}

# Update workflow
PUT /api/workflows/:id

# Delete workflow
DELETE /api/workflows/:id

# Execute workflow
POST /api/workflows/:id/execute
```

### Executions

```bash
# List executions
GET /api/executions?workflowId=xxx&status=success

# Get execution
GET /api/executions/:id

# Cancel execution
POST /api/executions/:id/cancel

# Retry execution
POST /api/executions/:id/retry
```

### AI

```bash
# Interpret natural language
POST /api/ai/interpret
{
  "prompt": "Send SMS to customers when stock is low",
  "apiKey": "optional_user_key",
  "dryRun": false
}

# Validate workflow
POST /api/ai/validate
{
  "workflow": {...}
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests
npm test --workspace=@taktak/server

# Run with coverage
npm run test:coverage
```

## 🛠️ Development

### Project Structure

```
taktak/
├── apps/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   └── server/          # Express backend
│       ├── src/
│       │   ├── config/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── engine/
│       │   ├── middleware/
│       │   └── utils/
│       └── package.json
├── packages/
│   └── types/           # Shared TypeScript types
├── docker-compose.yml
├── package.json
└── README.md
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

### Adding a New Node Type

1. Add type to `packages/types/src/index.ts`
2. Create handler in `apps/server/src/engine/nodes/`
3. Register in `apps/server/src/engine/nodeExecutor.ts`
4. Add UI component in `apps/client/src/components/nodes/`

## 📊 Monitoring

### Logs

Logs are stored in `./logs/` with daily rotation:
- `app-YYYY-MM-DD.log`: All logs
- `app-error-YYYY-MM-DD.log`: Error logs only

### Metrics

Access metrics via:
- Health endpoint: `/health/detailed`
- Database info: Check PouchDB/CouchDB admin panels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- PouchDB/CouchDB for offline-first sync
- The open-source community

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@taktak.example

---

**Built with ❤️ for local businesses that need reliable automation**

