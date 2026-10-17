import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, shell, screen, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import type { DeckData, ViewMode } from '../src/types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentMode: ViewMode = 'widget';
let periodicReminderTimer: NodeJS.Timeout | null = null;

const WIDGET_WIDTH = 380;
const WIDGET_HEIGHT = 600;
const DECK_WIDTH = 1120;
const DECK_HEIGHT = 760;

const DATA_FILE_PATH = path.join(app.getPath('userData'), 'd-deck-data.json');

// Default starter data
const DEFAULT_DECK_DATA: DeckData = {
  tasks: [
    {
      id: 'task-1',
      title: 'D-Deck Desktop Widget Architecture',
      description: 'Test frameless transparency and quick-add widget triggers.',
      category: 'coding',
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: true,
      subtasks: [
        { id: 'sub-1', title: 'Frameless drag handles', completed: true },
        { id: 'sub-2', title: 'Local storage IPC persistence', completed: true },
      ],
      meta: { tag: 'Architecture' }
    },
    {
      id: 'task-2',
      title: 'Drink 3.5 Liters of Pure Water',
      description: 'Maintain hydration throughout the day for focus and energy.',
      category: 'daily',
      priority: 'urgent',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: true,
      subtasks: [],
      meta: { tag: 'Hydration' }
    },
    {
      id: 'task-3',
      title: 'Review Project Milestones for Portfolio',
      description: 'Prepare upcoming release packages and showcase on website.',
      category: 'projects',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      durationDays: 3,
      reminderEnabled: true,
      subtasks: [],
    },
    {
      id: 'task-4',
      title: 'Weekend Gaming Session',
      description: 'Try out new multiplayer campaign with squad.',
      category: 'gaming',
      priority: 'low',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: false,
      subtasks: [],
      meta: { platform: 'PC / Steam' }
    },
    {
      id: 'task-5',
      title: 'Watch Interstellar or Sci-Fi Classic',
      description: 'Relaxing weekend evening movie backlog.',
      category: 'movies',
      priority: 'low',
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: false,
      subtasks: [],
      meta: { rating: 5, status: 'planned' }
    }
  ],
  waterHistory: {},
  settings: {
    startupOnBoot: true,
    alwaysOnTop: true,
    notificationsEnabled: true,
    soundEnabled: true,
    widgetOpacity: 0.95,
    waterTargetMl: 3500,
    waterReminderIntervalMin: 90,
    activeTheme: 'cyber'
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
      settings: { ...DEFAULT_DECK_DATA.settings, ...parsed.settings }
    };
  } catch (err) {
    console.error('Failed to read local data:', err);
    return DEFAULT_DECK_DATA;
  }
}

function writeDeckData(data: DeckData): boolean {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write local data:', err);
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

function checkLoginReminders() {
  const data = readDeckData();
  if (!data.settings.notificationsEnabled) return;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = data.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  const todaysTasks = data.tasks.filter(t => !t.completed && t.dueDate === today);
  const urgentTasks = data.tasks.filter(t => !t.completed && t.priority === 'urgent');

  setTimeout(() => {
    if (overdueTasks.length > 0) {
      showSystemNotification(
        'D-Deck Notice: Missed Tasks',
        `You missed ${overdueTasks.length} task(s) from previous days. Let's conquer them today!`
      );
    } else if (todaysTasks.length > 0) {
      showSystemNotification(
        'D-Deck Ready: Daily Agenda',
        `You have ${todaysTasks.length} task(s) scheduled for today.`
      );
    }

    // Hydration check
    const todayWater = data.waterHistory[today]?.currentMl || 0;
    const target = data.settings.waterTargetMl || 3500;
    if (todayWater < target * 0.3) {
      setTimeout(() => {
        showSystemNotification(
          'D-Deck Hydration',
          `Stay energized! You've logged ${todayWater}ml / ${target}ml water today. Grab a glass!`
        );
      }, 5000);
    }
  }, 2000);
}

function startPeriodicReminderLoop() {
  if (periodicReminderTimer) clearInterval(periodicReminderTimer);

  // Check every 30 minutes for water reminder & urgent tasks
  periodicReminderTimer = setInterval(() => {
    const data = readDeckData();
    if (!data.settings.notificationsEnabled) return;

    const today = new Date().toISOString().split('T')[0];
    const todayWater = data.waterHistory[today]?.currentMl || 0;
    const target = data.settings.waterTargetMl || 3500;

    if (todayWater < target) {
      const remaining = target - todayWater;
      showSystemNotification(
        '💧 D-Deck Hydration Check',
        `Time to hydrate! Drink a glass of water (${remaining}ml remaining to hit your 3.5L goal).`
      );
    }
  }, 90 * 60 * 1000); // every 90 minutes
}

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Position widget on the top-right desktop area by default
  const defaultX = screenWidth - WIDGET_WIDTH - 24;
  const defaultY = 48;

  mainWindow = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    x: defaultX,
    y: defaultY,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  // Simple transparent/circle icon representation or default icon
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('D-Deck: Desktop Task & Habit Hub');

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
      label: 'Switch to Full Command Center',
      click: () => {
        setWindowMode('deck');
      }
    },
    {
      label: 'Switch to Compact Widget',
      click: () => {
        setWindowMode('widget');
      }
    },
    { type: 'separator' },
    {
      label: '💧 Log 250ml Water',
      click: () => {
        const data = readDeckData();
        const today = new Date().toISOString().split('T')[0];
        const current = data.waterHistory[today]?.currentMl || 0;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (!data.waterHistory[today]) {
          data.waterHistory[today] = {
            date: today,
            targetMl: data.settings.waterTargetMl,
            currentMl: 250,
            entries: [{ id: 'w-' + Date.now(), time: timeStr, amountMl: 250 }]
          };
        } else {
          data.waterHistory[today].currentMl += 250;
          data.waterHistory[today].entries.push({ id: 'w-' + Date.now(), time: timeStr, amountMl: 250 });
        }
        writeDeckData(data);
        showSystemNotification('💧 Water Logged', `+250ml recorded! Total today: ${current + 250}ml.`);
        if (mainWindow) mainWindow.webContents.send('deck:data-updated', data);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit D-Deck',
      click: () => {
        app.quit();
      }
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

  const [currentX, currentY] = mainWindow.getPosition();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  if (mode === 'widget') {
    // Resize to compact widget
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setSize(WIDGET_WIDTH, WIDGET_HEIGHT, true);
    // Keep near top right
    const x = Math.min(currentX, screenWidth - WIDGET_WIDTH - 20);
    const y = Math.min(currentY, screenHeight - WIDGET_HEIGHT - 20);
    mainWindow.setPosition(x, y, true);
  } else {
    // Resize to full deck command center
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setSize(DECK_WIDTH, DECK_HEIGHT, true);
    // Center on screen
    const x = Math.max(0, Math.floor((screenWidth - DECK_WIDTH) / 2));
    const y = Math.max(0, Math.floor((screenHeight - DECK_HEIGHT) / 2));
    mainWindow.setPosition(x, y, true);
  }
}

// IPC Handlers
ipcMain.handle('deck:get-data', () => {
  return readDeckData();
});

ipcMain.handle('deck:save-data', (_, data: DeckData) => {
  return writeDeckData(data);
});

ipcMain.handle('window:set-mode', (_, mode: ViewMode) => {
  setWindowMode(mode);
});

ipcMain.handle('window:get-mode', () => {
  return currentMode;
});

ipcMain.handle('window:set-always-on-top', (_, flag: boolean) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
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

ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('app:open-external', (_, url: string) => {
  shell.openExternal(url);
});

// App Lifecycle
app.whenReady().then(() => {
  createMainWindow();
  setupTray();
  checkLoginReminders();
  startPeriodicReminderLoop();

  // Configure auto-launch setting if enabled
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
