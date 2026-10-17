import React from 'react';
import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showText?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showText = true }) => {
  const configs = {
    urgent: {
      color: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]',
      dot: 'bg-rose-400 animate-ping',
      label: 'URGENT',
    },
    high: {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'HIGH',
    },
    medium: {
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
      label: 'MED',
    },
    low: {
      color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
      label: 'LOW',
    },
  };

  const current = configs[priority] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold border ${current.color}`}>
      <span className="relative flex h-1.5 w-1.5">
        {priority === 'urgent' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dot} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dot}`}></span>
      </span>
      {showText && current.label}
    </span>
  );
};
