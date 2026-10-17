import React, { useState } from 'react';
import type { Task, TaskCategory, AppSettings, StreakMetrics } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { WidgetHeader } from './WidgetHeader';
import { TaskItem } from './TaskItem';
import { QuickAddModal } from './QuickAddModal';
import { Plus, Flame } from 'lucide-react';
import { sfx } from '../../services/audio';

interface WidgetViewProps {
  tasks: Task[];
  settings: AppSettings;
  streak?: StreakMetrics;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onExpandToDeck: () => void;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const WidgetView: React.FC<WidgetViewProps> = ({
  tasks,
  settings,
  streak,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
  onExpandToDeck,
  onToggleAlwaysOnTop,
  onMinimize,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory;
  });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const handleOpenAdd = () => {
    if (window.electronAPI?.openQuickAdd) {
      window.electronAPI.openQuickAdd(selectedCategory === 'all' ? 'coding' : selectedCategory);
    } else {
      setIsQuickAddOpen(true);
    }
  };

  return (
    <div className="w-[280px] h-[380px] flex flex-col glass-surface rounded-2xl overflow-hidden font-sans select-none shadow-2xl">
      <WidgetHeader
        onQuickAdd={handleOpenAdd}
        onExpandToDeck={onExpandToDeck}
        alwaysOnTop={settings.alwaysOnTop}
        onToggleAlwaysOnTop={onToggleAlwaysOnTop}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col px-2.5 pt-2 pb-2 overflow-hidden space-y-1.5">
        
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => {
              sfx.playClick();
              setSelectedCategory('all');
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-mono tracking-tight transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-amber-300 border-amber-400/30 font-semibold'
                : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            All ({tasks.filter(t => !t.completed).length})
          </button>

          {CATEGORIES.map(cat => {
            const count = tasks.filter(t => t.category === cat.id && !t.completed).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  sfx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-mono tracking-tight transition-all whitespace-nowrap border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-zinc-800 text-amber-300 border-amber-400/30 font-semibold'
                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${cat.dot}`}></span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="text-[8px] text-zinc-400">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tasks Container */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-1">
          {filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500 space-y-2">
              <p className="text-[11px] text-zinc-400">No tasks in this list.</p>
              <button
                onClick={handleOpenAdd}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 hover:border-emerald-400/30 text-zinc-300 hover:text-emerald-300 border border-white/[0.08] text-[11px] font-mono transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add task
              </button>
            </div>
          ) : (
            <>
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}

              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Done ({completedTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                  </div>
                  <div className="space-y-1.5">
                    {completedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onToggleSubtask={onToggleSubtask}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Status with Consistency & Velocity Streak */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5" title="Local Streak Counter: 100% offline & private">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400/20" />
            <span className="text-zinc-300 font-semibold">{streak?.currentStreak ?? 0}d streak</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">{streak?.weeklyVelocity ?? 0}/wk</span>
          </div>
          <div>
            <span>{pendingTasks.length} pending</span>
          </div>
        </div>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={onAddTask}
        initialCategory={selectedCategory === 'all' ? 'coding' : selectedCategory}
      />
    </div>
  );
};
