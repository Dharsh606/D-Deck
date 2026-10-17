import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, shell, screen, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import type { DeckData, ViewMode } from '../src/types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentMode: ViewMode = 'widget';
let reminderIntervalTimer: NodeJS.Timeout | null = null;

const WIDGET_WIDTH = 280;
const WIDGET_HEIGHT = 380;
const DECK_WIDTH = 1080;
const DECK_HEIGHT = 740;

const DATA_FILE_PATH = path.join(app.getPath('userData'), 'd-deck-data.json');

// Default initial storage - clean empty slate
const DEFAULT_DECK_DATA: DeckData = {
  tasks: [],
  settings: {
    startupOnBoot: true,
    alwaysOnTop: true,
    notificationsEnabled: true,
    soundEnabled: true,
    widgetOpacity: 0.95,
  }
};

function readDeckData(): DeckData {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_DECK_DATA, null, 2), 'utf-8');
      return DEFAULT_DECK_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DECK_DATA,
      ...parsed,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      settings: { ...DEFAULT_DECK_DATA.settings, ...parsed.settings }
    };
  } catch (err) {
    console.error('Failed reading data:', err);
    return DEFAULT_DECK_DATA;
  }
}

function writeDeckData(data: DeckData): boolean {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing data:', err);
    return false;
  }
}

function showSystemNotification(title: string, body: string, silent: boolean = false) {
  if (!Notification.isSupported()) return;
  const notification = new Notification({
    title,
    body,
    silent
  });
  notification.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  notification.show();
}

// 3-Stage Precise Reminder Engine (-5m, exact, +5m)
function checkThreeStageReminders() {
  const data = readDeckData();
  if (!data.settings.notificationsEnabled) return;

  const now = new Date();
  let changed = false;

  for (const task of data.tasks) {
    if (task.completed || !task.reminderEnabled || !task.dueDate) continue;

    // Time-based 3-stage notifications
    if (task.dueTime) {
      const [y, m, d] = task.dueDate.split('-').map(Number);
      const [hh, mm] = task.dueTime.split(':').map(Number);
      const targetDate = new Date(y, m - 1, d, hh, mm, 0);
      const diffMinutes = (targetDate.getTime() - now.getTime()) / (60 * 1000);

      if (!task.reminderStages) {
        task.reminderStages = {};
      }

      // Stage 1: 5 minutes before (diff between 3.5 and 5.5 min)
      if (diffMinutes <= 5.5 && diffMinutes >= 3.5 && !task.reminderStages.pre5) {
        task.reminderStages.pre5 = true;
        changed = true;
        showSystemNotification(
          'D-Deck (Upcoming in 5m)',
          `Scheduled at ${task.dueTime}: "${task.title}"`
        );
      }

      // Stage 2: Exact due time (diff between -1.5 and 0.5 min)
      if (diffMinutes <= 0.5 && diffMinutes >= -1.5 && !task.reminderStages.exact) {
        task.reminderStages.exact = true;
        changed = true;
        showSystemNotification(
          'D-Deck Reminder',
          `Time for: "${task.title}" (${task.dueTime})`
        );
      }

      // Stage 3: 5 minutes after if still pending (diff between -7.0 and -4.5 min)
      if (diffMinutes <= -4.5 && diffMinutes >= -7.0 && !task.reminderStages.post5 && !task.completed) {
        task.reminderStages.post5 = true;
        changed = true;
        showSystemNotification(
          'D-Deck Follow-up (+5m)',
          `"${task.title}" is still pending. Don't forget to mark it done!`
        );
      }
    }
  }

  if (changed) {
    writeDeckData(data);
    if (mainWindow) {
      mainWindow.webContents.send('deck:data-updated', data);
    }
  }
}

function checkStartupAgenda() {
  const data = readDeckData();
  if (!data.settings.notificationsEnabled) return;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = data.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  const dueTodayTasks = data.tasks.filter(t => !t.completed && t.dueDate === today);

  if (overdueTasks.length > 0) {
    const taskSample = overdueTasks.slice(0, 2).map(t => `"${t.title}"`).join(', ');
    showSystemNotification(
      'D-Deck Attention',
      `${overdueTasks.length} task(s) are overdue: ${taskSample}`
    );
  } else if (dueTodayTasks.length > 0) {
    showSystemNotification(
      'D-Deck Agenda',
      `You have ${dueTodayTasks.length} task(s) scheduled for today.`
    );
  }
}

function startReminderLoop() {
  if (reminderIntervalTimer) clearInterval(reminderIntervalTimer);

  // Monitor reminders every 20 seconds for precise -5m, exact, and +5m trigger
  reminderIntervalTimer = setInterval(() => {
    checkThreeStageReminders();
  }, 20 * 1000);
}

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const savedData = readDeckData();
  const savedX = savedData.settings.widgetX;
  const savedY = savedData.settings.widgetY;

  // Restore saved position or default to top-right
  const initialX = (savedX !== undefined && savedX >= 0 && savedX < screenWidth)
    ? savedX
    : screenWidth - WIDGET_WIDTH - 24;
  const initialY = (savedY !== undefined && savedY >= 0 && savedY < screenHeight)
    ? savedY
    : 48;

  const appIconPath = path.join(app.getAppPath(), 'public', 'icon.png');

  mainWindow = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    x: initialX,
    y: initialY,
    icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: savedData.settings.alwaysOnTop ?? true,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  }

  // Persist window position permanently whenever the user moves it
  mainWindow.on('moved', () => {
    if (!mainWindow) return;
    const [x, y] = mainWindow.getPosition();
    const data = readDeckData();
    if (currentMode === 'widget') {
      data.settings.widgetX = x;
      data.settings.widgetY = y;
    } else {
      data.settings.deckX = x;
      data.settings.deckY = y;
    }
    writeDeckData(data);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  const iconPath = path.join(app.getAppPath(), 'public', 'icon.png');
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 })
    : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('D-Deck');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open D-Deck Widget',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Switch to Full View',
      click: () => setWindowMode('deck')
    },
    {
      label: 'Switch to Widget',
      click: () => setWindowMode('widget')
    },
    { type: 'separator' },
    {
      label: 'Quit D-Deck',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

function setWindowMode(mode: ViewMode) {
  if (!mainWindow) return;
  currentMode = mode;

  const data = readDeckData();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  if (mode === 'widget') {
    mainWindow.setAlwaysOnTop(data.settings.alwaysOnTop ?? true);
    mainWindow.setSize(WIDGET_WIDTH, WIDGET_HEIGHT, true);

    const x = data.settings.widgetX ?? Math.min(mainWindow.getPosition()[0], screenWidth - WIDGET_WIDTH - 20);
    const y = data.settings.widgetY ?? Math.min(mainWindow.getPosition()[1], screenHeight - WIDGET_HEIGHT - 20);
    mainWindow.setPosition(x, y, true);
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setSize(DECK_WIDTH, DECK_HEIGHT, true);

    const x = data.settings.deckX ?? Math.max(0, Math.floor((screenWidth - DECK_WIDTH) / 2));
    const y = data.settings.deckY ?? Math.max(0, Math.floor((screenHeight - DECK_HEIGHT) / 2));
    mainWindow.setPosition(x, y, true);
  }
}

// IPC Handlers
ipcMain.handle('deck:get-data', () => readDeckData());
ipcMain.handle('deck:save-data', (_, data: DeckData) => writeDeckData(data));
ipcMain.handle('window:set-mode', (_, mode: ViewMode) => setWindowMode(mode));
ipcMain.handle('window:get-mode', () => currentMode);
ipcMain.handle('window:set-always-on-top', (_, flag: boolean) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(flag);
});
ipcMain.handle('app:set-startup', (_, flag: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: flag,
    path: process.execPath,
    args: ['--autostart']
  });
  return true;
});
ipcMain.handle('app:notify', (_, title: string, body: string, options?: { silent?: boolean }) => {
  showSystemNotification(title, body, options?.silent ?? false);
});
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('app:open-external', (_, url: string) => shell.openExternal(url));
ipcMain.handle('window:save-position', (_, mode: ViewMode, x: number, y: number) => {
  const data = readDeckData();
  if (mode === 'widget') {
    data.settings.widgetX = x;
    data.settings.widgetY = y;
  } else {
    data.settings.deckX = x;
    data.settings.deckY = y;
  }
  writeDeckData(data);
});

// App Lifecycle
app.whenReady().then(() => {
  createMainWindow();
  setupTray();
  checkStartupAgenda();
  startReminderLoop();

  const initialData = readDeckData();
  if (initialData.settings.startupOnBoot) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: ['--autostart']
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
