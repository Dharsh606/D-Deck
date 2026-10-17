import React from 'react';
import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showText?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showText = true }) => {
  const configs = {
    urgent: {
      color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
      label: 'Urgent',
    },
    high: {
      color: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      dot: 'bg-amber-400',
      label: 'High',
    },
    medium: {
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'Med',
    },
    low: {
      color: 'bg-zinc-400/10 text-zinc-300 border-zinc-500/20',
      dot: 'bg-zinc-400',
      label: 'Low',
    },
  };

  const current = configs[priority] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono border ${current.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {showText && current.label}
    </span>
  );
};
