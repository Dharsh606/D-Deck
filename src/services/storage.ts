import type { DeckData, AppSettings } from '../types';

const STORAGE_KEY = 'd_deck_offline_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  startupOnBoot: true,
  alwaysOnTop: true,
  notificationsEnabled: true,
  soundEnabled: true,
  widgetOpacity: 0.95,
};

export const INITIAL_DATA: DeckData = {
  tasks: [], // Clean slate - no preloaded dummy tasks
  settings: DEFAULT_SETTINGS
};

export async function loadDeckData(): Promise<DeckData> {
  if (window.electronAPI) {
    try {
      const data = await window.electronAPI.getDeckData();
      if (data && Array.isArray(data.tasks)) return data;
    } catch (e) {
      console.warn('Electron IPC read error, falling back to local storage:', e);
    }
  }

  // LocalStorage fallback for browser testing
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_DATA,
        ...parsed,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
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
