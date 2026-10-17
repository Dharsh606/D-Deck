import React, { useState } from 'react';
import { Check, Clock, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';
import { getCategoryTheme } from '../../constants/categories';
import { PriorityBadge } from '../common/PriorityBadge';
import { sfx } from '../../services/audio';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onToggleSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryTheme = getCategoryTheme(task.category);

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      sfx.playComplete();
    } else {
      sfx.playClick();
    }
    onToggle(task.id);
  };

  const getDueLabel = () => {
    if (!task.dueDate) return null;
    if (isOverdue) return <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</span>;
    if (isDueToday) return <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Today</span>;
    
    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    return <span className="text-zinc-500 font-mono">{diffDays}d left</span>;
  };

  return (
    <div 
      className={`group relative rounded-xl border transition-all duration-150 overflow-hidden ${
        task.completed 
          ? 'bg-canvas-900/40 border-white/[0.04] opacity-50' 
          : isOverdue
          ? 'bg-canvas-850/80 border-rose-500/30'
          : 'bg-canvas-850/70 border-white/[0.06] hover:border-white/[0.12] hover:bg-canvas-800/80'
      }`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          {/* Minimalist Checkbox */}
          <button
            onClick={handleCheckboxClick}
            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              task.completed 
                ? 'bg-zinc-200 border-zinc-200 text-zinc-950' 
                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/60'
            }`}
          >
            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between gap-2">
              <span 
                className={`text-xs font-normal leading-snug cursor-pointer transition-all ${
                  task.completed 
                    ? 'line-through text-zinc-500' 
                    : 'text-zinc-200 hover:text-zinc-100'
                }`}
              >
                {task.title}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <PriorityBadge priority={task.priority} showText={false} />
              </div>
            </div>

            {/* Badges / Meta row */}
            <div className="flex items-center gap-2 mt-1.5 text-[10px]">
              <span className={`px-1.5 py-0.5 rounded font-mono border text-[9px] ${categoryTheme.badge}`}>
                {categoryTheme.label}
              </span>

              {getDueLabel()}

              {task.durationDays && task.durationDays > 1 && (
                <span className="text-zinc-500 font-mono">
                  {task.durationDays}d span
                </span>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-zinc-400 font-mono">
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-zinc-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {(task.description || (task.subtasks && task.subtasks.length > 0)) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded-md"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Drawer */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-white/[0.04] pl-6 text-[11px] space-y-2">
            {task.description && (
              <p className="text-zinc-400 leading-relaxed font-sans">{task.description}</p>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1 mt-1.5">
                {task.subtasks.map(sub => (
                  <div 
                    key={sub.id} 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
                  >
                    <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                      sub.completed ? 'bg-zinc-300 border-zinc-300 text-zinc-950' : 'border-zinc-700'
                    }`}>
                      {sub.completed && <Check className="w-2 h-2 stroke-[3]" />}
                    </div>
                    <span className={sub.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
