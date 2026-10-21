import React, { useState } from 'react';
import type { Task, AppSettings, StreakMetrics } from '../../types';
import { WidgetHeader } from './WidgetHeader';
import { TaskItem } from './TaskItem';
import { QuickAddModal } from './QuickAddModal';
import { Plus, Flame, CheckCircle2 } from 'lucide-react';

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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleOpenAdd = () => {
    if (window.electronAPI?.openQuickAdd) {
      window.electronAPI.openQuickAdd();
    } else {
      setIsQuickAddOpen(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-surface rounded-2xl overflow-hidden font-sans select-none shadow-2xl">
      <WidgetHeader
        onQuickAdd={handleOpenAdd}
        onExpandToDeck={onExpandToDeck}
        alwaysOnTop={settings.alwaysOnTop}
        onToggleAlwaysOnTop={onToggleAlwaysOnTop}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col px-3 pt-2 pb-2.5 overflow-hidden space-y-2">
        {/* Tasks Container */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 scrollbar-thin">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">All clear</p>
                <p className="text-[11px] text-white/70">Capture what needs to be done</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
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
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                      Done ({completedTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-white/20" />
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
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80 font-sans">
          <div className="flex items-center gap-1.5" title="Local Streak Counter: 100% offline & private">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="text-white font-semibold">{streak?.currentStreak ?? 0}d streak</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">{streak?.weeklyVelocity ?? 0}/wk</span>
          </div>
          <div className="text-[10px] text-white/70 font-mono">
            <span>{pendingTasks.length} pending</span>
          </div>
        </div>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={onAddTask}
      />
    </div>
  );
};
