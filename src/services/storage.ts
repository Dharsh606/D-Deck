import type { DeckData, Task, DailyWaterData, AppSettings } from '../types';

const STORAGE_KEY = 'd_deck_offline_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  startupOnBoot: true,
  alwaysOnTop: true,
  notificationsEnabled: true,
  soundEnabled: true,
  widgetOpacity: 0.95,
  waterTargetMl: 3500,
  waterReminderIntervalMin: 90,
  activeTheme: 'cyber'
};

export const INITIAL_DATA: DeckData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Fix responsive layout bug on mobile viewport',
      description: 'Check navbar padding and horizontal scroll issue on small screens.',
      category: 'coding',
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: true,
      subtasks: [
        { id: 'sub-1', title: 'Inspect media queries', completed: true },
        { id: 'sub-2', title: 'Test on phone browser', completed: true }
      ],
      meta: { tag: 'Bugfix' }
    },
    {
      id: 'task-2',
      title: 'Drink water (3.5L daily target)',
      description: 'Track daily water intake throughout the day.',
      category: 'daily',
      priority: 'urgent',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: true,
      subtasks: [],
      meta: { tag: 'Water' }
    },
    {
      id: 'task-3',
      title: 'Finish portfolio project writeup and release',
      description: 'Upload latest screenshots and write clear summary.',
      category: 'projects',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      durationDays: 2,
      reminderEnabled: true,
      subtasks: [],
    },
    {
      id: 'task-4',
      title: 'Witcher 3 DLC / Cyberpunk session',
      description: 'Finish side quest storyline.',
      category: 'gaming',
      priority: 'low',
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: false,
      subtasks: [],
      meta: { platform: 'PC / Steam', status: 'in-progress' }
    },
    {
      id: 'task-5',
      title: 'Watch Dune: Part Two',
      description: 'Weekend movie queue.',
      category: 'movies',
      priority: 'low',
      completed: false,
      createdAt: new Date().toISOString(),
      reminderEnabled: false,
      subtasks: [],
      meta: { rating: 5, status: 'planned' }
    },
    {
      id: 'task-6',
      title: 'Evening 5K run',
      description: 'Stretching and 30-minute run.',
      category: 'fitness',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reminderEnabled: true,
      subtasks: []
    }
  ],
  waterHistory: {},
  settings: DEFAULT_SETTINGS
};

export async function loadDeckData(): Promise<DeckData> {
  if (window.electronAPI) {
    try {
      const data = await window.electronAPI.getDeckData();
      if (data && data.tasks) return data;
    } catch (e) {
      console.warn('Electron IPC read error, falling back to local storage:', e);
    }
  }

  // LocalStorage fallback for browser or fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_DATA,
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
      };
    }
  } catch (e) {
    console.error('Failed reading localStorage:', e);
  }

  return INITIAL_DATA;
}

export async function saveDeckData(data: DeckData): Promise<boolean> {
  if (window.electronAPI) {
    try {
      await window.electronAPI.saveDeckData(data);
    } catch (e) {
      console.warn('Failed to save via electron IPC:', e);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed saving localStorage:', e);
    return false;
  }
}

export function exportDataAsJSON(data: DeckData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `d-deck-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
