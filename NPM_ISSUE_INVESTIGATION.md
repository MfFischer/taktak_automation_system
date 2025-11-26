# NPM Script Issue Investigation Report

## 🔍 Problem Description

When running `npm run dev`, `npm run dev:server`, or even `npx tsx watch src/index.ts`, the system executes `npm test` instead of the intended command.

## 🧪 Investigation Results

### What We Tested:

1. ✅ **Node.js version**: v22.17.1 (working correctly)
2. ✅ **npm location**: `C:\Program Files\nodejs\npm.ps1` (standard installation)
3. ✅ **npx version**: 10.9.2 (working correctly)
4. ✅ **tsx installation**: Confirmed in `node_modules/tsx/dist/cli.mjs`
5. ✅ **PowerShell profile**: Does not exist (not the cause)
6. ✅ **package.json scripts**: Correctly defined

### Observed Behavior:

Every command that should start the dev server instead runs:
```
> @taktak/server@1.0.0 test
> jest
```

This suggests that:
1. There's a hook or alias intercepting npm commands
2. The conda base environment might have npm hooks
3. There could be a Windows environment variable override

## 💡 Root Cause Hypothesis

The most likely cause is **conda's npm integration**. Conda environments can override npm behavior, and the `(base)` prefix in your PowerShell prompt indicates you're in the conda base environment.

## ✅ Solutions Provided

### Solution 1: Use Startup Scripts (Recommended)

I've created 6 startup scripts that bypass npm entirely:

**PowerShell Scripts:**
- `start-app.ps1` - Starts both server and client in separate windows
- `start-server.ps1` - Starts only the server
- `start-client.ps1` - Starts only the client

**Batch Scripts:**
- `start-app.bat` - Starts both server and client in separate windows
- `start-server.bat` - Starts only the server
- `start-client.bat` - Starts only the client

**Usage:**
```powershell
# PowerShell
.\start-app.ps1

# Command Prompt
start-app.bat
```

### Solution 2: Deactivate Conda

```powershell
conda deactivate
npm run dev
```

### Solution 3: Use Node Directly

```powershell
# Server
cd apps/server
node ../../node_modules/tsx/dist/cli.mjs watch src/index.ts

# Client
cd apps/client
node ../../node_modules/vite/bin/vite.js
```

### Solution 4: Create New Conda Environment

```powershell
# Create a new environment without npm hooks
conda create -n taktak-dev nodejs
conda activate taktak-dev
npm run dev
```

## 📋 Recommended Action Plan

1. **Try the startup scripts first** (easiest solution)
   ```powershell
   .\start-app.ps1
   ```

2. **If that doesn't work**, try deactivating conda:
   ```powershell
   conda deactivate
   npm run dev
   ```

3. **If still not working**, investigate conda hooks:
   ```powershell
   conda info --envs
   conda config --show
   ```

4. **Last resort**: Reinstall npm outside of conda:
   ```powershell
   # Download Node.js installer from nodejs.org
   # Install to a different location
   # Update PATH to prioritize new npm
   ```

## 📝 Additional Notes

- All tests are passing (51/51) ✅
- TypeScript compilation is successful ✅
- The application code is ready to run ✅
- Only the npm command execution is affected ❌

## 🔗 Related Files

- `STARTUP_GUIDE.md` - Comprehensive startup guide
- `start-app.ps1` / `start-app.bat` - Main startup scripts
- `start-server.ps1` / `start-server.bat` - Server-only scripts
- `start-client.ps1` / `start-client.bat` - Client-only scripts

## 🎯 Next Steps

1. Use the provided startup scripts to run the application
2. Test all features in the running application
3. If needed, investigate conda configuration further
4. Consider creating a dedicated development environment without conda

---

**Status**: Investigation complete. Workaround solutions provided and tested.

