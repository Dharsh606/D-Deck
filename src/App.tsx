import React, { useState, useEffect } from 'react';
import type { Task, DeckData, ViewMode, AppSettings } from './types';
import { loadDeckData, saveDeckData, DEFAULT_SETTINGS } from './services/storage';
import { WidgetView } from './components/widget/WidgetView';
import { DeckView } from './components/deck/DeckView';
import { sfx } from './services/audio';

export const App: React.FC = () => {
  const [deckData, setDeckData] = useState<DeckData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('widget');
  const [isLoading, setIsLoading] = useState(true);

  // Load local data on mount
  useEffect(() => {
    async function init() {
      const data = await loadDeckData();
      setDeckData(data);
      sfx.setEnabled(data.settings.soundEnabled);

      if (window.electronAPI) {
        try {
          const initialMode = await window.electronAPI.getWindowMode();
          setViewMode(initialMode || 'widget');
        } catch {
          setViewMode('widget');
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // Sync and save changes
  const updateData = (newData: DeckData) => {
    setDeckData(newData);
    saveDeckData(newData);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSwitchMode = async (mode: ViewMode) => {
    setViewMode(mode);
    if (window.electronAPI) {
      await window.electronAPI.setWindowMode(mode);
    }
  };

  const handleToggleAlwaysOnTop = async () => {
    if (!deckData) return;
    const newFlag = !deckData.settings.alwaysOnTop;
    const updated = {
      ...deckData,
      settings: { ...deckData.settings, alwaysOnTop: newFlag }
    };
    updateData(updated);
    if (window.electronAPI) {
      await window.electronAPI.setAlwaysOnTop(newFlag);
    }
  };

  const handleUpdateSettings = async (partialSettings: Partial<AppSettings>) => {
    if (!deckData) return;
    const updatedSettings = { ...deckData.settings, ...partialSettings };
    if (partialSettings.soundEnabled !== undefined) {
      sfx.setEnabled(partialSettings.soundEnabled);
    }
    if (partialSettings.startupOnBoot !== undefined && window.electronAPI) {
      await window.electronAPI.setStartupOnBoot(partialSettings.startupOnBoot);
    }
    updateData({ ...deckData, settings: updatedSettings });
  };

  const handleAddTask = (taskInput: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!deckData) return;
    const newTask: Task = {
      ...taskInput,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    updateData({
      ...deckData,
      tasks: [newTask, ...deckData.tasks],
    });
  };

  const handleToggleTask = (taskId: string) => {
    if (!deckData) return;
    const updatedTasks = deckData.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateData({ ...deckData, tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!deckData) return;
    sfx.playClick();
    const updatedTasks = deckData.tasks.filter(t => t.id !== taskId);
    updateData({ ...deckData, tasks: updatedTasks });
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (!deckData) return;
    sfx.playClick();
    const updatedTasks = deckData.tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map(sub => 
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    });
    updateData({ ...deckData, tasks: updatedTasks });
  };

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  if (isLoading || !deckData) {
    return (
      <div className="w-[280px] h-[380px] flex items-center justify-center glass-surface text-zinc-400 font-mono text-xs rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-300">Loading D-Deck...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {viewMode === 'widget' ? (
        <WidgetView
          tasks={deckData.tasks}
          settings={deckData.settings}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onToggleSubtask={handleToggleSubtask}
          onExpandToDeck={() => handleSwitchMode('deck')}
          onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      ) : (
        <DeckView
          tasks={deckData.tasks}
          settings={deckData.settings}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onToggleSubtask={handleToggleSubtask}
          onUpdateSettings={handleUpdateSettings}
          onSwitchToWidget={() => handleSwitchMode('widget')}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
