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
  const todayWater = deckData?.waterHistory[todayStr] || {
    date: todayStr,
    targetMl: deckData?.settings.waterTargetMl || 3500,
    currentMl: 0,
    entries: []
  };

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

  const handleAddWater = (amountMl: number) => {
    if (!deckData) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const currentEntry = deckData.waterHistory[todayStr] || {
      date: todayStr,
      targetMl: deckData.settings.waterTargetMl,
      currentMl: 0,
      entries: []
    };

    const updatedWater = {
      ...currentEntry,
      currentMl: currentEntry.currentMl + amountMl,
      entries: [
        ...currentEntry.entries,
        { id: 'w-' + Date.now(), time: timeStr, amountMl }
      ]
    };

    updateData({
      ...deckData,
      waterHistory: {
        ...deckData.waterHistory,
        [todayStr]: updatedWater
      }
    });
  };

  const handleResetWater = () => {
    if (!deckData) return;
    sfx.playClick();
    const currentEntry = deckData.waterHistory[todayStr] || {
      date: todayStr,
      targetMl: deckData.settings.waterTargetMl,
      currentMl: 0,
      entries: []
    };

    const updatedWater = {
      ...currentEntry,
      currentMl: 0,
      entries: []
    };

    updateData({
      ...deckData,
      waterHistory: {
        ...deckData.waterHistory,
        [todayStr]: updatedWater
      }
    });
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
      <div className="w-[380px] h-[600px] flex items-center justify-center bg-deck-950 text-cyan-400 font-mono text-xs rounded-2xl border border-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING D-DECK...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {viewMode === 'widget' ? (
        <WidgetView
          tasks={deckData.tasks}
          waterData={todayWater}
          settings={deckData.settings}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onToggleSubtask={handleToggleSubtask}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
          onExpandToDeck={() => handleSwitchMode('deck')}
          onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      ) : (
        <DeckView
          tasks={deckData.tasks}
          waterData={todayWater}
          settings={deckData.settings}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onToggleSubtask={handleToggleSubtask}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
          onUpdateSettings={handleUpdateSettings}
          onSwitchToWidget={() => handleSwitchMode('widget')}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
