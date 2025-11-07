const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // License management
  checkLicense: (licenseKey) => ipcRenderer.invoke('check-license', licenseKey),
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
});

