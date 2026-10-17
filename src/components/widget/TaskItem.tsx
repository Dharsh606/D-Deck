import React, { useState } from 'react';
import { Check, Clock, Trash2, ChevronDown, ChevronUp, Calendar, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';
import { getCategoryConfig } from '../../constants/categories';
import { PriorityBadge } from '../common/PriorityBadge';
import { sfx } from '../../services/audio';
import confetti from 'canvas-confetti';

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
  const categoryConfig = getCategoryConfig(task.category);

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      sfx.playComplete();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: [categoryConfig.color, '#00f2fe', '#ffffff']
      });
    } else {
      sfx.playClick();
    }
    onToggle(task.id);
  };

  const getDueLabel = () => {
    if (!task.dueDate) return null;
    if (isOverdue) return <span className="text-rose-400 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</span>;
    if (isDueToday) return <span className="text-amber-400 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Today</span>;
    
    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    return <span className="text-slate-400 font-mono">{diffDays}d left</span>;
  };

  return (
    <div 
      className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${
        task.completed 
          ? 'bg-deck-900/40 border-slate-800/40 opacity-65' 
          : isOverdue
          ? 'bg-deck-900/80 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
          : 'bg-deck-900/75 border-slate-700/40 hover:border-slate-600/60 hover:bg-deck-850/90'
      }`}
    >
      {/* Category color indicator strip on left */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1 transition-all"
        style={{ backgroundColor: task.completed ? '#475569' : categoryConfig.color }}
      />

      <div className="p-3 pl-3.5">
        <div className="flex items-start gap-2.5">
          {/* Custom Futuristic Checkbox */}
          <button
            onClick={handleCheckboxClick}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              task.completed 
                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-400 text-deck-950 shadow-[0_0_8px_#00f2fe]' 
                : 'border-slate-600 hover:border-cyan-400 bg-deck-950/60'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between gap-2">
              <span 
                className={`text-xs font-medium leading-snug cursor-pointer transition-all ${
                  task.completed 
                    ? 'line-through text-slate-500' 
                    : 'text-slate-100 hover:text-cyan-300'
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
              {/* Category Pill */}
              <span 
                className="px-1.5 py-0.5 rounded font-mono font-medium tracking-wider uppercase border text-[9px]"
                style={{ 
                  color: categoryConfig.color, 
                  borderColor: `${categoryConfig.color}40`,
                  backgroundColor: `${categoryConfig.color}15` 
                }}
              >
                {categoryConfig.label}
              </span>

              {/* Due Date Indicator */}
              {getDueLabel()}

              {/* Multi-day duration */}
              {task.durationDays && task.durationDays > 1 && (
                <span className="text-slate-400 font-mono">
                  ⏱ {task.durationDays}d span
                </span>
              )}

              {/* Subtask count */}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-cyan-400 font-mono">
                  ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {(task.description || (task.subtasks && task.subtasks.length > 0)) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-slate-500 hover:text-slate-300 rounded-md"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Details Drawer */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 pl-7 text-[11px] space-y-2">
            {task.description && (
              <p className="text-slate-300/80 leading-relaxed font-sans">{task.description}</p>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                  Checklist
                </span>
                {task.subtasks.map(sub => (
                  <div 
                    key={sub.id} 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      sub.completed ? 'bg-cyan-500 border-cyan-500 text-deck-950' : 'border-slate-600'
                    }`}>
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className={sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Platform / link meta if available */}
            {task.meta && (
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-slate-400">
                {task.meta.platform && <span>🎮 {task.meta.platform}</span>}
                {task.meta.status && <span>Status: {task.meta.status}</span>}
                {task.meta.rating && <span>Rating: {'★'.repeat(task.meta.rating)}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
