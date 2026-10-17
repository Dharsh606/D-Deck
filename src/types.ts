export type TaskCategory = 
  | 'coding'
  | 'gaming'
  | 'movies'
  | 'projects'
  | 'daily'
  | 'fitness'
  | 'water'
  | string;

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskMeta {
  rating?: number; // 1 to 5 stars for movies/games
  status?: 'planned' | 'in-progress' | 'completed' | 'dropped';
  platform?: string; // PC, Steam, PS5, Web, Mobile
  link?: string; // repo, doc, or streaming link
  tag?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  durationDays?: number; // How many days task lasts
  reminderEnabled: boolean;
  subtasks: Subtask[];
  meta?: TaskMeta;
}

export interface WaterEntry {
  id: string;
  time: string; // HH:mm
  amountMl: number;
}

export interface DailyWaterData {
  date: string; // YYYY-MM-DD
  targetMl: number; // e.g. 3500 ml (3.5 L)
  currentMl: number;
  entries: WaterEntry[];
}

export interface AppSettings {
  startupOnBoot: boolean;
  alwaysOnTop: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  widgetOpacity: number; // 0.8 to 1.0
  waterTargetMl: number; // default 3500 (3.5L)
  waterReminderIntervalMin: number; // e.g. 90 mins
  activeTheme: 'cyber' | 'stealth' | 'aurora' | 'emerald';
  lastWaterReminderTimestamp?: number;
}

export interface DeckData {
  tasks: Task[];
  waterHistory: Record<string, DailyWaterData>;
  settings: AppSettings;
}

export type ViewMode = 'widget' | 'deck';

export interface CategoryConfig {
  id: TaskCategory;
  label: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  description: string;
}

export interface ElectronAPI {
  getDeckData: () => Promise<DeckData>;
  saveDeckData: (data: DeckData) => Promise<boolean>;
  setWindowMode: (mode: ViewMode) => Promise<void>;
  getWindowMode: () => Promise<ViewMode>;
  setAlwaysOnTop: (flag: boolean) => Promise<void>;
  setStartupOnBoot: (flag: boolean) => Promise<boolean>;
  showNotification: (title: string, body: string, options?: { silent?: boolean }) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
