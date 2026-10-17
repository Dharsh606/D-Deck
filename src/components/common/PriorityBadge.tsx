import React from 'react';
import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showText?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showText = true }) => {
  const configs = {
    urgent: {
      color: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      dot: 'bg-rose-400',
      label: 'Urgent',
    },
    high: {
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      dot: 'bg-amber-400',
      label: 'High',
    },
    medium: {
      color: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      dot: 'bg-blue-400',
      label: 'Med',
    },
    low: {
      color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      dot: 'bg-zinc-500',
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
