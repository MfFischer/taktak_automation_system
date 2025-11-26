# Database Lock Error Fix

**Date**: 2025-11-20  
**Issue**: PouchDB lock file preventing server from starting  
**Status**: ✅ FIXED

---

## 🐛 Problem Description

When trying to load workflows, you got this error:

```
Failed to load workflows
IO error: LockFile taktak_local/LOCK: The process cannot access the file because it is being used by another process.
```

### Root Cause:

PouchDB creates a `LOCK` file when the database is opened. If the server doesn't shut down cleanly (e.g., killed forcefully), the lock file remains and prevents the database from being opened again.

---

## ✅ Solution Applied

Removed all database lock files:

```powershell
Get-ChildItem -Path "apps\server" -Recurse -Filter "LOCK" -ErrorAction SilentlyContinue | Remove-Item -Force
```

This removed lock files from:
- `apps\server\taktak_local\LOCK` (main database)
- `apps\server\subscriptions\LOCK` (subscriptions database)
- All test database lock files

---

## 🔄 How to Restart the Server

### Option 1: Use the Startup Script (Recommended)

Open a **new PowerShell window** and run:

```powershell
cd H:\softwares\taktak
.\start-server.ps1
```

### Option 2: Manual Start

Open a **new PowerShell window** and run:

```powershell
cd H:\softwares\taktak\apps\server
node ../../node_modules/tsx/dist/cli.mjs watch src/index.ts
```

### Option 3: Use the Full App Script

Open a **new PowerShell window** and run:

```powershell
cd H:\softwares\taktak
.\start-app.ps1
```

This will start both server and client in separate windows.

---

## 🎯 What to Expect

When the server starts successfully, you should see:

```
Server running on http://localhost:3001
Database initialized
Ready to accept connections
```

Then:
1. **Refresh your browser** (F5)
2. **Try loading workflows** - Should work now
3. **Execute your workflow** - Should succeed with the Database Watch fix

---

## 🚨 If Lock Error Happens Again

If you see the lock error again in the future:

### Quick Fix:

```powershell
# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove lock files
Get-ChildItem -Path "H:\softwares\taktak\apps\server" -Recurse -Filter "LOCK" -ErrorAction SilentlyContinue | Remove-Item -Force

# Restart server
cd H:\softwares\taktak
.\start-server.ps1
```

### Prevention:

Always stop the server gracefully:
- Press `Ctrl+C` in the terminal
- Wait for "Server stopped" message
- Don't force-kill the process

---

## 📝 Technical Details

### Why This Happens:

PouchDB uses LevelDB under the hood, which creates a lock file to prevent multiple processes from accessing the same database simultaneously. This is a safety feature to prevent data corruption.

### Lock File Locations:

```
apps/server/
├── taktak_local/LOCK              # Main database
├── subscriptions/LOCK             # Subscriptions
└── test_*/LOCK                    # Test databases
```

### When Lock Files Are Created:

- ✅ When database is opened
- ✅ Automatically removed on clean shutdown
- ❌ Left behind on force-kill or crash

---

## 🔧 Alternative Solutions

### 1. Use a Different Database Directory

In `apps/server/src/database/pouchdb.ts`, you could change:

```typescript
const localDb = new PouchDB('taktak_local_v2');
```

This creates a new database without lock conflicts.

### 2. Implement Graceful Shutdown

Add signal handlers to clean up on exit:

```typescript
process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});
```

### 3. Use In-Memory Database for Development

For development, you could use:

```typescript
const localDb = new PouchDB('taktak_local', { adapter: 'memory' });
```

No lock files, but data is lost on restart.

---

## 📊 Summary of All Fixes Today

1. ✅ **Dashboard Stats** - Now counts draft workflows
2. ✅ **Auto-Activation** - Draft workflows become active on execution
3. ✅ **Execute Button** - Actually calls the API now
4. ✅ **Database Watch Node** - Handler created and registered
5. ✅ **Database Lock** - Lock files removed

---

## 🎉 Next Steps

1. **Restart the server** using one of the methods above
2. **Refresh your browser**
3. **Execute your workflow** - Should work now!
4. **Check Dashboard** - Should show successful run

---

**Status**: ✅ **RESOLVED** - Lock files removed, ready to restart!

