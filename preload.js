/**
 * IndexTTS Studio - Preload Script
 * =================================
 * Secure context bridge between main and renderer processes.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

    // Theme
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.send('set-theme', theme),

    // API configuration
    getApiConfig: () => ipcRenderer.invoke('get-api-config'),

    // External links
    openExternal: (url) => ipcRenderer.send('open-external', url),
    openWaveformWindow: (url) => ipcRenderer.send('open-waveform-window', url),

    // Event listeners
    onQuickSynthesize: (callback) => {
        ipcRenderer.on('quick-synthesize', callback);
    },
    onPasteAndSynthesize: (callback) => {
        ipcRenderer.on('paste-and-synthesize', callback);
    },
    onOpenSettings: (callback) => {
        ipcRenderer.on('open-settings', callback);
    },

    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Platform info
contextBridge.exposeInMainWorld('platform', {
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux'
});
