# Taktak Startup Guide

This guide provides multiple ways to start the Taktak application.

## 🚀 Quick Start (Recommended)

### Option 1: Use Startup Scripts (Easiest)

**Windows PowerShell:**
```powershell
.\start-app.ps1
```

**Windows Command Prompt:**
```cmd
start-app.bat
```

This will open two separate windows:
- **Server** running on `http://localhost:3001`
- **Client** running on `http://localhost:5173`

### Option 2: Start Server and Client Separately

**PowerShell:**
```powershell
# Terminal 1 - Server
.\start-server.ps1

# Terminal 2 - Client
.\start-client.ps1
```

**Command Prompt:**
```cmd
# Terminal 1 - Server
start-server.bat

# Terminal 2 - Client
start-client.bat
```

### Option 3: Use npm (if working)

```bash
# Start both server and client
npm run dev

# Or start separately
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

## 🔧 Troubleshooting

### Issue: npm commands run tests instead of dev server

**Cause:** This appears to be related to conda environment or PowerShell profile hooks.

**Solutions:**

1. **Use the startup scripts** (recommended) - They bypass npm and run commands directly
2. **Deactivate conda:**
   ```powershell
   conda deactivate
   npm run dev
   ```
3. **Use npx directly:**
   ```powershell
   # Server
   cd apps/server
   npx tsx watch src/index.ts
   
   # Client
   cd apps/client
   npx vite
   ```

### Issue: Port already in use

If you see "Port 3001 already in use" or "Port 5173 already in use":

```powershell
# Find and kill the process using the port
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different ports
# Server: Edit apps/server/src/index.ts and change PORT
# Client: Edit apps/client/vite.config.ts and add server.port
```

### Issue: Module not found errors

```bash
# Install dependencies
npm install

# Or install in each workspace
cd apps/server && npm install
cd apps/client && npm install
cd packages/types && npm install
```

## 📍 Application URLs

- **Client (Frontend):** http://localhost:5173
- **Server (API):** http://localhost:3001
- **API Documentation:** http://localhost:3001/api-docs

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in specific workspace
npm test --workspace=@taktak/server
```

## 🏗️ Building for Production

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build:server
npm run build:client

# Start production server
cd apps/server
npm start
```

## 📦 Project Structure

```
taktak/
├── apps/
│   ├── client/          # React frontend (Vite)
│   └── server/          # Express backend
├── packages/
│   └── types/           # Shared TypeScript types
├── start-app.ps1        # PowerShell startup script (both)
├── start-server.ps1     # PowerShell startup script (server)
├── start-client.ps1     # PowerShell startup script (client)
├── start-app.bat        # Batch startup script (both)
├── start-server.bat     # Batch startup script (server)
└── start-client.bat     # Batch startup script (client)
```

## 💡 Tips

1. **First time setup:** Run `npm install` in the root directory
2. **Build types first:** Run `npm run build --workspace=@taktak/types` before starting dev servers
3. **Use separate terminals:** Keep server and client in separate terminal windows for easier debugging
4. **Check logs:** Server logs appear in the server terminal, client logs in the browser console
5. **Hot reload:** Both server and client support hot reload - changes will be reflected automatically

## 🆘 Need Help?

If you encounter issues:

1. Check that Node.js 18+ is installed: `node --version`
2. Check that npm is installed: `npm --version`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check for port conflicts: `netstat -ano | findstr :3001`
5. Review error messages in the terminal

## 🎉 Success!

Once both server and client are running, open your browser to:
**http://localhost:5173**

You should see the Taktak workflow automation platform!

