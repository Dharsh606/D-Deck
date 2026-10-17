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
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    accent: '#f59e0b',
    border: 'hover:border-amber-500/30',
    dot: 'bg-amber-400',
  },
  {
    id: 'projects',
    label: 'Projects',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    accent: '#10b981',
    border: 'hover:border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
    accent: '#f97316',
    border: 'hover:border-orange-500/30',
    dot: 'bg-orange-400',
  },
  {
    id: 'movies',
    label: 'Movies',
    badge: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/25',
    accent: '#eab308',
    border: 'hover:border-yellow-400/30',
    dot: 'bg-yellow-400',
  },
  {
    id: 'daily',
    label: 'Daily',
    badge: 'bg-white/10 text-zinc-100 border-white/20',
    accent: '#f4f4f5',
    border: 'hover:border-white/30',
    dot: 'bg-zinc-200',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    badge: 'bg-lime-500/10 text-lime-300 border-lime-500/25',
    accent: '#84cc16',
    border: 'hover:border-lime-500/30',
    dot: 'bg-lime-400',
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
