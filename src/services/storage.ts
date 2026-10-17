import type { DeckData, AppSettings, Task, StreakMetrics } from '../types';

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
  settings: DEFAULT_SETTINGS,
  streak: {
    currentStreak: 0,
    bestStreak: 0,
    totalCompleted: 0,
    weeklyVelocity: 0,
  }
};

export function computeStreakMetrics(tasks: Task[], existingStreak?: StreakMetrics): StreakMetrics {
  const completedTasks = tasks.filter(t => t.completed && t.completedAt);
  const totalCompleted = completedTasks.length;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate 7-day velocity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const weeklyVelocity = completedTasks.filter(
    t => t.completedAt && t.completedAt >= sevenDaysAgoStr
  ).length;

  // Unique days where tasks were completed
  const activeDaysSet = new Set<string>();
  for (const t of completedTasks) {
    if (t.completedAt) {
      activeDaysSet.add(t.completedAt.split('T')[0]);
    }
  }

  // Consecutive days streak
  let currentStreak = 0;
  if (activeDaysSet.size > 0) {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let checkDate: Date | null = null;
    if (activeDaysSet.has(todayStr)) {
      checkDate = new Date(today);
    } else if (activeDaysSet.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    }

    if (checkDate) {
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (activeDaysSet.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const bestStreak = Math.max(currentStreak, existingStreak?.bestStreak ?? 0);
  const sortedDays = Array.from(activeDaysSet).sort().reverse();

  return {
    currentStreak,
    bestStreak,
    lastActiveDate: sortedDays[0] || undefined,
    totalCompleted,
    weeklyVelocity,
  };
}

export function autoResetRoutineTasks(tasks: Task[]): { tasks: Task[]; changed: boolean } {
  const todayStr = new Date().toISOString().split('T')[0];
  let changed = false;

  const updatedTasks = tasks.map(task => {
    if (task.isRoutine && task.completed) {
      const completedDay = task.completedAt ? task.completedAt.split('T')[0] : task.dueDate;
      if (completedDay && completedDay < todayStr) {
        changed = true;
        return {
          ...task,
          completed: false,
          completedAt: undefined,
          lastResetDate: todayStr,
          dueDate: todayStr,
          reminderStages: {},
        };
      }
    }
    return task;
  });

  return { tasks: updatedTasks, changed };
}

export async function loadDeckData(): Promise<DeckData> {
  let loadedData: DeckData = INITIAL_DATA;

  if (window.electronAPI) {
    try {
      const data = await window.electronAPI.getDeckData();
      if (data && Array.isArray(data.tasks)) {
        loadedData = {
          ...INITIAL_DATA,
          ...data,
          tasks: data.tasks,
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
        };
      }
    } catch (e) {
      console.warn('Electron IPC read error, falling back to local storage:', e);
    }
  } else {
    // LocalStorage fallback for browser testing
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        loadedData = {
          ...INITIAL_DATA,
          ...parsed,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        };
      }
    } catch (e) {
      console.error('Failed reading localStorage:', e);
    }
  }

  // Check and apply Daily Habit Auto-Reset
  const { tasks: resetTasks, changed } = autoResetRoutineTasks(loadedData.tasks);
  const streak = computeStreakMetrics(resetTasks, loadedData.streak);

  const finalData: DeckData = {
    ...loadedData,
    tasks: resetTasks,
    streak,
  };

  if (changed) {
    saveDeckData(finalData);
  }

  return finalData;
}

export async function saveDeckData(data: DeckData): Promise<boolean> {
  const updatedStreak = computeStreakMetrics(data.tasks, data.streak);
  const fullData: DeckData = {
    ...data,
    streak: updatedStreak,
  };

  if (window.electronAPI) {
    try {
      await window.electronAPI.saveDeckData(fullData);
    } catch (e) {
      console.warn('Failed to save via electron IPC:', e);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
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
