/**
 * VoxAI-Studio - Electron Main Process
 * ========================================
 * Handles window creation, system tray, global hotkeys, and backend management.
 */

const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeTheme, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
    API_HOST: '127.0.0.1',
    API_PORT: 8000,
    WINDOW_WIDTH: 1200,
    WINDOW_HEIGHT: 800,
    MIN_WIDTH: 900,
    MIN_HEIGHT: 600,
};

let mainWindow = null;
let tray = null;
let backendProcess = null;

// ============================================
// Single Instance Lock
// ============================================
// Prevent multiple instances of the app from running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // Another instance is already running
    console.log('[App] Another instance is already running. Exiting...');
    app.quit();
} else {
    // Handle second instance attempt
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.log('[App] Second instance detected, focusing existing window');
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: CONFIG.WINDOW_WIDTH,
        height: CONFIG.WINDOW_HEIGHT,
        minWidth: CONFIG.MIN_WIDTH,
        minHeight: CONFIG.MIN_HEIGHT,
        frame: false, // Frameless window for custom title bar
        transparent: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, 'src/assets/icons/icon.png'),
        show: false, // Show when ready
    });

    // Load the main HTML file
    mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        // Open DevTools in development
        if (process.argv.includes('--dev')) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Enable DevTools shortcut (Ctrl+Shift+I)
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.shift && input.key.toLowerCase() === 'i') {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    // Handle window close - minimize to tray instead
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
        return true;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Create system tray icon and menu
 */
function createTray() {
    const iconPath = path.join(__dirname, 'src/assets/icons/tray.png');

    try {
        tray = new Tray(iconPath);
    } catch (e) {
        // Fallback if icon not found
        console.log('Tray icon not found, using default');
        return;
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show IndexTTS Studio',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: 'Quick Synthesize',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.webContents.send('quick-synthesize');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'API Server Status',
            enabled: false,
            id: 'api-status'
        },
        { type: 'separator' },
        {
            label: 'Settings',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.webContents.send('open-settings');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('IndexTTS Studio');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

/**
 * Register global keyboard shortcuts
 */
function registerGlobalShortcuts() {
    // Ctrl+Shift+S - Quick synthesize
    globalShortcut.register('CommandOrControl+Shift+S', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('quick-synthesize');
        }
    });

    // Ctrl+Shift+V - Paste and synthesize
    globalShortcut.register('CommandOrControl+Shift+V', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('paste-and-synthesize');
        }
    });
}

/**
 * Start the Python FastAPI backend server silently
 */
function startBackend() {
    const projectRoot = path.join(__dirname, '..');
    const MAX_RESTARTS = 3;
    let startAttempts = 0;

    function spawnServerProcess() {
        console.log('[Backend] Attempting to start API server...');

        const isWindows = process.platform === 'win32';
        const projectRoot = path.join(__dirname, '..');

        let command;
        let args;

        // Priority 1: Internal Portable Runtime (True Portable Mode)
        const runtimePath = isWindows
            ? path.join(projectRoot, 'runtime', 'Scripts', 'python.exe')
            : path.join(projectRoot, 'runtime', 'bin', 'python');

        if (fs.existsSync(runtimePath)) {
            console.log('[Backend] Using internal portable runtime:', runtimePath);
            command = runtimePath;
            args = ['api_server.py', '--host', CONFIG.API_HOST, '--port', String(CONFIG.API_PORT)];
        }
        // Priority 2: Standard venv
        else if (fs.existsSync(path.join(projectRoot, '.venv'))) {
            console.log('[Backend] Using .venv with uv run');
            command = isWindows ? 'uv.exe' : 'uv';
            args = ['run', 'python', 'api_server.py', '--host', CONFIG.API_HOST, '--port', String(CONFIG.API_PORT)];
        }
        // Priority 3: System Python (Fallback)
        else {
            console.log('[Backend] Using system command: uv run python');
            command = isWindows ? 'uv.exe' : 'uv';
            args = ['run', 'python', 'api_server.py', '--host', CONFIG.API_HOST, '--port', String(CONFIG.API_PORT)];
        }

        try {
            backendProcess = spawn(command, args, {
                cwd: projectRoot,
                detached: false,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            backendProcess.stdout.on('data', (data) => {
                console.log(`[Backend] ${data.toString().trim()}`);
            });

            backendProcess.stderr.on('data', (data) => {
                console.log(`[Backend Error] ${data.toString().trim()}`);
            });

            backendProcess.on('error', (err) => {
                console.error('[Backend] Failed to start:', err.message);
                // Try alternative: direct python call
                tryDirectPython(projectRoot);
            });

            backendProcess.on('exit', (code) => {
                console.log(`[Backend] Process exited with code ${code}`);
                backendProcess = null;

                // If exited with error (code 1 usually means port in use)
                if (code !== 0 && code !== null) {
                    console.log('[Backend] Process exited with error. Checking if server is already running...');

                    // First check if a server is ALREADY responding on the port
                    checkServerHealth((isRunning) => {
                        if (isRunning) {
                            console.log('[Backend] ✓ Server is already running on port ' + CONFIG.API_PORT + '. Using existing instance.');
                            // Server is running, no need to restart
                            return;
                        }

                        // Server not responding - might be a real crash, try restart
                        if (startAttempts < MAX_RESTARTS) {
                            startAttempts++;
                            console.log(`[Backend] Server not responding. Restarting... (Attempt ${startAttempts}/${MAX_RESTARTS})`);
                            setTimeout(spawnServerProcess, 2000);
                        } else {
                            console.error('[Backend] Failed to start server after multiple attempts.');
                        }
                    });
                }
            });

            console.log('[Backend] Server process started (PID:', backendProcess.pid, ')');
        } catch (err) {
            console.error('[Backend] Spawn failed:', err.message);
            tryDirectPython(projectRoot);
        }
    }

    // Check if server is already running
    checkServerHealth((isRunning) => {
        if (isRunning) {
            console.log('[Backend] Server already running');
            return;
        }

        // Server not running, start it
        spawnServerProcess();
    });
}

/**
 * Check server health status
 */
function checkServerHealth(callback) {
    const http = require('http');
    const checkUrl = `http://${CONFIG.API_HOST}:${CONFIG.API_PORT}/health`;

    // Set a short timeout for the check
    const req = http.get(checkUrl, (res) => {
        if (res.statusCode === 200) {
            callback(true);
        } else {
            callback(false);
        }
        // Consume response data to free memory
        res.resume();
    });

    req.on('error', () => {
        callback(false);
    });

    req.setTimeout(1000, () => {
        req.destroy();
        callback(false);
    });
}

/**
 * Poll for server availability
 */
function waitForServer(retries, callback) {
    if (retries <= 0) {
        callback(false);
        return;
    }

    checkServerHealth((isRunning) => {
        if (isRunning) {
            callback(true);
        } else {
            console.log(`[Backend] Retrying connection... (${retries} attempts left)`);
            setTimeout(() => {
                waitForServer(retries - 1, callback);
            }, 1000);
        }
    });
}

/**
 * Fallback: Try direct Python if uv fails
 */
function tryDirectPython(projectRoot) {
    console.log('[Backend] Trying direct Python...');

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const args = ['api_server.py', '--host', CONFIG.API_HOST, '--port', String(CONFIG.API_PORT)];

    try {
        backendProcess = spawn(pythonCmd, args, {
            cwd: projectRoot,
            detached: false,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        backendProcess.on('error', (err) => {
            console.error('[Backend] Python also failed:', err.message);
        });

        console.log('[Backend] Python server started (PID:', backendProcess.pid, ')');
    } catch (err) {
        console.error('[Backend] All methods failed:', err.message);
    }
}

/**
 * Stop the backend server gracefully
 */
async function stopBackend() {
    console.log('[Backend] Initiating graceful shutdown...');

    // First, try to shutdown via API (this cleans up VRAM)
    try {
        const http = require('http');
        const shutdownUrl = `http://${CONFIG.API_HOST}:${CONFIG.API_PORT}/api/shutdown`;

        await new Promise((resolve, reject) => {
            const req = http.request(shutdownUrl, { method: 'POST', timeout: 3000 }, (res) => {
                console.log('[Backend] Shutdown API response:', res.statusCode);
                resolve();
            });
            req.on('error', (err) => {
                console.log('[Backend] Shutdown API not reachable:', err.message);
                resolve(); // Continue even if API fails
            });
            req.on('timeout', () => {
                req.destroy();
                resolve();
            });
            req.end();
        });

        // Wait for graceful shutdown to complete
        console.log('[Backend] Waiting for graceful shutdown...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
        console.log('[Backend] Graceful shutdown request failed:', err.message);
    }

    // Force kill if process is still running
    if (backendProcess) {
        console.log('[Backend] Force stopping remaining process...');

        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t'], {
                windowsHide: true
            });
        } else {
            backendProcess.kill('SIGTERM');
        }

        backendProcess = null;
    }

    console.log('[Backend] Server stopped');
}


/**
 * IPC Handlers for renderer communication
 */
function setupIpcHandlers() {
    // Window controls
    ipcMain.on('window-minimize', () => {
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('window-maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.on('window-close', () => {
        if (mainWindow) mainWindow.close();
    });

    // Get window state
    ipcMain.handle('window-is-maximized', () => {
        return mainWindow ? mainWindow.isMaximized() : false;
    });

    // Theme handling
    ipcMain.handle('get-theme', () => {
        return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    });

    ipcMain.on('set-theme', (event, theme) => {
        nativeTheme.themeSource = theme; // 'dark', 'light', or 'system'
    });

    // Open external links
    ipcMain.on('open-external', (event, url) => {
        shell.openExternal(url);
    });

    // Get API config
    ipcMain.handle('get-api-config', () => {
        return {
            host: CONFIG.API_HOST,
            port: CONFIG.API_PORT,
            baseUrl: `http://${CONFIG.API_HOST}:${CONFIG.API_PORT}`
        };
    });

    // Open waveform window
    //  ipcMain.on('open-waveform-window', (event, audioUrl) => {
    //      createWaveformWindow(audioUrl);
    //   });
}

/**
 * Create a standalone waveform window
 */
/* function createWaveformWindow(audioUrl) {
    const win = new BrowserWindow({
        width: 1000,
        height: 400,
        minWidth: 600,
        minHeight: 300,
        frame: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, 'src/assets/icons/icon.png'),
        show: false
    });

    // Pass audio URL as query parameter
    const loadUrl = `file://${path.join(__dirname, 'src/waveform.html')}?audio=${encodeURIComponent(audioUrl)}`;
    win.loadURL(loadUrl);

    win.once('ready-to-show', () => {
        win.show();
    });
} */

// App lifecycle
app.whenReady().then(() => {
    // Only proceed if we got the single instance lock
    if (!gotTheLock) return;

    // Start backend server first (silently in background)
    startBackend();

    createWindow();
    createTray();
    registerGlobalShortcuts();
    setupIpcHandlers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();

    // Stop backend server
    stopBackend();
});

app.on('before-quit', () => {
    app.isQuitting = true;
});
