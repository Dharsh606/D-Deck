import React, { useState } from 'react';
import type { Task, TaskCategory, DailyWaterData, AppSettings } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { WidgetHeader } from './WidgetHeader';
import { TaskItem } from './TaskItem';
import { WaterBar } from './WaterBar';
import { QuickAddModal } from './QuickAddModal';
import { Plus, CheckCircle2, ListFilter, Sparkles } from 'lucide-react';
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

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory;
  });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const totalCompleted = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="w-[380px] h-[600px] flex flex-col glass-panel rounded-2xl shadow-deck-card border border-slate-700/50 overflow-hidden font-['Outfit'] select-none">
      {/* Draggable Header */}
      <WidgetHeader
        onQuickAdd={() => setIsQuickAddOpen(true)}
        onExpandToDeck={onExpandToDeck}
        alwaysOnTop={settings.alwaysOnTop}
        onToggleAlwaysOnTop={onToggleAlwaysOnTop}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col px-3.5 pt-2 pb-3 overflow-hidden space-y-2.5">
        
        {/* Quick Water Bar */}
        <WaterBar
          currentMl={waterData?.currentMl || 0}
          targetMl={settings.waterTargetMl || 3500}
          onAddWater={onAddWater}
          onResetWater={onResetWater}
          compact={true}
        />

        {/* Category Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              sfx.playClick();
              setSelectedCategory('all');
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono tracking-wider transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.25)] font-bold'
                : 'bg-deck-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            ALL ({tasks.filter(t => !t.completed).length})
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
                className={`px-2 py-1 rounded-xl text-[10px] font-mono tracking-wider transition-all whitespace-nowrap border flex items-center gap-1 ${
                  isSelected
                    ? `${cat.borderColor} ${cat.bgGlow} font-bold`
                    : 'bg-deck-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{cat.label.split(' ')[0]}</span>
                {count > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[9px] flex items-center justify-center text-slate-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Task List Scrollable Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-deck-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">No pending tasks</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Use + to add a task to this list.</p>
              </div>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-mono hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>
          ) : (
            <>
              {/* Pending Tasks */}
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}

              {/* Completed Tasks Divider & Section */}
              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                      Completed ({completedTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-800/80" />
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

        {/* Bottom Status Ribbon */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
            <span>{pendingTasks.length} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{completionRate}% completed</span>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={onAddTask}
        initialCategory={selectedCategory === 'all' ? 'coding' : selectedCategory}
      />
    </div>
  );
};
