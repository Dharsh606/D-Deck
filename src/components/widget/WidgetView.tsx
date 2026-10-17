import React, { useState } from 'react';
import type { Task, TaskCategory, DailyWaterData, AppSettings } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { WidgetHeader } from './WidgetHeader';
import { TaskItem } from './TaskItem';
import { WaterBar } from './WaterBar';
import { QuickAddModal } from './QuickAddModal';
import { Plus } from 'lucide-react';
import { sfx } from '../../services/audio';

interface WidgetViewProps {
  tasks: Task[];
  waterData?: DailyWaterData;
  settings: AppSettings;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddWater: (amountMl: number) => void;
  onResetWater?: () => void;
  onExpandToDeck: () => void;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const WidgetView: React.FC<WidgetViewProps> = ({
  tasks,
  waterData,
  settings,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
  onAddWater,
  onResetWater,
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

  return (
    <div className="w-[370px] h-[580px] flex flex-col glass-surface rounded-2xl overflow-hidden font-sans select-none">
      <WidgetHeader
        onQuickAdd={() => setIsQuickAddOpen(true)}
        onExpandToDeck={onExpandToDeck}
        alwaysOnTop={settings.alwaysOnTop}
        onToggleAlwaysOnTop={onToggleAlwaysOnTop}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col px-3.5 pt-2.5 pb-3 overflow-hidden space-y-2.5">
        
        {/* Minimalist Water Capsule */}
        <WaterBar
          currentMl={waterData?.currentMl || 0}
          targetMl={settings.waterTargetMl || 3500}
          onAddWater={onAddWater}
          onResetWater={onResetWater}
          compact={true}
        />

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              sfx.playClick();
              setSelectedCategory('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-tight transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-zinc-100 border-white/[0.12] font-semibold'
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
                className={`px-2 py-1 rounded-lg text-[10px] font-mono tracking-tight transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-white/[0.12] font-semibold'
                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`}></span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="text-[9px] text-zinc-400">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tasks Container */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5">
          {filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2.5">
              <p className="text-xs text-zinc-400">No tasks in this list.</p>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/[0.08] text-xs font-mono transition-all flex items-center gap-1.5"
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

        {/* Footer Status */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{pendingTasks.length} pending</span>
          </div>
          <div>
            <span>{completedTasks.length} completed</span>
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
