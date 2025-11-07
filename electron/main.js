const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Server configuration
const SERVER_PORT = 3001;
const isDev = process.env.NODE_ENV === 'development';

// Auto-updater configuration
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true; // Install on quit

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'available',
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'not-available' });
  }
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'error',
      error: err.message,
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download progress: ${progressObj.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'downloading',
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'downloaded',
      version: info.version,
    });
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../public/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Show window when ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, '../apps/client/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  if (isDev) {
    // In development, server is already running via npm run dev
    console.log('Development mode: Using existing server on port', SERVER_PORT);
    return;
  }

  // In production, start the bundled server
  const serverPath = path.join(__dirname, '../apps/server/dist/index.js');
  
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: SERVER_PORT,
    },
    stdio: 'inherit',
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
    dialog.showErrorBox(
      'Server Error',
      'Failed to start the Taktak server. Please try restarting the application.'
    );
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('Server exited with code:', code);
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// App lifecycle
app.whenReady().then(() => {
  startServer();

  // Wait a bit for server to start
  setTimeout(() => {
    createWindow();

    // Check for updates after window is created (only in production)
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000); // Wait 3 seconds after app starts
    }
  }, isDev ? 500 : 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('check-license', async (event, licenseKey) => {
  // TODO: Implement license validation
  // For now, return true for development
  return { valid: true, tier: 'pro' };
});

ipcMain.handle('activate-license', async (event, licenseKey) => {
  // TODO: Implement license activation
  return { success: true, message: 'License activated successfully' };
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { status: 'dev-mode', message: 'Updates are disabled in development mode' };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return { status: 'success', updateInfo: result.updateInfo };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  if (isDev) {
    return { status: 'dev-mode', message: 'Updates are disabled in development mode' };
  }
  try {
    await autoUpdater.downloadUpdate();
    return { status: 'success', message: 'Update download started' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

ipcMain.handle('install-update', () => {
  if (isDev) {
    return { status: 'dev-mode', message: 'Updates are disabled in development mode' };
  }
  // This will quit the app and install the update
  autoUpdater.quitAndInstall(false, true);
  return { status: 'success', message: 'Installing update...' };
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

