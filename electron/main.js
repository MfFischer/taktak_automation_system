const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Server configuration
const SERVER_PORT = 3001;
const isDev = process.env.NODE_ENV === 'development';

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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

