import type { CategoryConfig, TaskCategory } from '../types';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'coding',
    label: 'Coding & Tech',
    icon: 'Code2',
    color: '#00f2fe',
    borderColor: 'border-cyan-500/40',
    bgGlow: 'bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.2)]',
    description: 'Bugs, features, algorithms, code reviews'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderGit2',
    color: '#f43f5e',
    borderColor: 'border-rose-500/40',
    bgGlow: 'bg-rose-500/10 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    description: 'Milestones, apps, architectures, and client deliverables'
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: 'Gamepad2',
    color: '#b827fc',
    borderColor: 'border-purple-500/40',
    bgGlow: 'bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(184,39,252,0.2)]',
    description: 'Backlog, campaigns, multiplayer sessions & updates'
  },
  {
    id: 'movies',
    label: 'Movies & Series',
    icon: 'Film',
    color: '#fbbf24',
    borderColor: 'border-amber-500/40',
    bgGlow: 'bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
    description: 'Watchlist, anime, cinema, and recommended series'
  },
  {
    id: 'daily',
    label: 'Daily Activities',
    icon: 'CheckSquare',
    color: '#6366f1',
    borderColor: 'border-indigo-500/40',
    bgGlow: 'bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    description: 'Everyday routines, errands, and priority chores'
  },
  {
    id: 'fitness',
    label: 'Fitness & Health',
    icon: 'Flame',
    color: '#10b981',
    borderColor: 'border-emerald-500/40',
    bgGlow: 'bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    description: 'Workouts, cardio, stretching, and physical goals'
  }
];

export function getCategoryConfig(id: TaskCategory): CategoryConfig {
  const match = CATEGORIES.find(c => c.id === id);
  if (match) return match;
  return {
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    icon: 'Tag',
    color: '#94a3b8',
    borderColor: 'border-slate-500/40',
    bgGlow: 'bg-slate-500/10 text-slate-300',
    description: 'Custom category'
  };
}
