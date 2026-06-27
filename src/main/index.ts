import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { registerHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

// ── Window state persistence ─────────────────────────────────────────────

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState(defaultWidth: number, defaultHeight: number): WindowState {
  try {
    if (fs.existsSync(windowStatePath)) {
      const raw = JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
      return {
        x: typeof raw.x === 'number' ? raw.x : -1,
        y: typeof raw.y === 'number' ? raw.y : -1,
        width: typeof raw.width === 'number' ? raw.width : defaultWidth,
        height: typeof raw.height === 'number' ? raw.height : defaultHeight,
        isMaximized: raw.isMaximized === true,
      };
    }
  } catch { /* corrupted state, use defaults */ }
  return { x: -1, y: -1, width: defaultWidth, height: defaultHeight, isMaximized: false };
}

function saveWindowState(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const bounds = mainWindow.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: mainWindow.isMaximized(),
    };
    fs.writeFileSync(windowStatePath, JSON.stringify(state, null, 2));
  } catch { /* best-effort */ }
}

// ── Window creation ───────────────────────────────────────────────────────

function createWindow(): void {
  const state = loadWindowState(1200, 800);

  mainWindow = new BrowserWindow({
    x: state.x >= 0 ? state.x : undefined,
    y: state.y >= 0 ? state.y : undefined,
    width: state.width,
    height: state.height,
    minWidth: 800,
    minHeight: 600,
    title: 'Glyph',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  if (state.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', () => {
    saveWindowState();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Basic IPC: ready check
ipcMain.handle('glyph:ping', () => 'pong');

app.whenReady().then(async () => {
  await registerHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
