import type { TaskCategory, TaskPriority } from '../types';

export interface CategoryTheme {
  id: TaskCategory;
  label: string;
  badge: string;
  accent: string;
  border: string;
  dot: string;
}

export const CATEGORIES: CategoryTheme[] = [
  {
    id: 'coding',
    label: 'Coding',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    accent: '#6366f1',
    border: 'hover:border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  {
    id: 'projects',
    label: 'Projects',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    accent: '#f43f5e',
    border: 'hover:border-rose-500/30',
    dot: 'bg-rose-400',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    accent: '#a855f7',
    border: 'hover:border-purple-500/30',
    dot: 'bg-purple-400',
  },
  {
    id: 'movies',
    label: 'Movies',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    accent: '#f59e0b',
    border: 'hover:border-amber-500/30',
    dot: 'bg-amber-400',
  },
  {
    id: 'daily',
    label: 'Daily',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    accent: '#3b82f6',
    border: 'hover:border-blue-500/30',
    dot: 'bg-blue-400',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    accent: '#10b981',
    border: 'hover:border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
];

export function getCategoryTheme(id: TaskCategory): CategoryTheme {
  const found = CATEGORIES.find(c => c.id === id);
  if (found) return found;
  return {
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    badge: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
    accent: '#71717a',
    border: 'hover:border-zinc-500/30',
    dot: 'bg-zinc-400',
  };
}
