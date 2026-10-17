import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar, Clock } from 'lucide-react';
import type { Task, TaskCategory, TaskPriority } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { sfx } from '../../services/audio';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialCategory?: TaskCategory;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialCategory = 'coding',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(initialCategory);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState<string>('11:30');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { id: 'st-' + Date.now(), title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sfx.playClick();
    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate,
      dueTime: dueTime.trim() || undefined,
      durationDays,
      reminderEnabled: true,
      subtasks,
    });

    setTitle('');
    setDescription('');
    setDueTime('11:30');
    setSubtasks([]);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-canvas-900 border border-white/[0.1] rounded-2xl shadow-2xl p-4 overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
            New Task
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 text-xs bg-canvas-950 border border-white/[0.08] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all"
            />
          </div>

          <div>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes or details..."
              className="w-full px-3 py-1.5 text-[11px] bg-canvas-950 border border-white/[0.08] rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none transition-all"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-mono transition-all border ${
                      isSelected
                        ? `${cat.badge} font-semibold`
                        : 'bg-canvas-950 text-zinc-400 border-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                Priority
              </label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 rounded-md text-[9px] font-mono uppercase transition-all border ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : p === 'high'
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
                          : p === 'medium'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-zinc-200 text-zinc-950 border-zinc-200 font-bold'
                        : 'bg-canvas-950 text-zinc-500 border-white/[0.04] hover:text-zinc-300'
                    }`}
                  >
                    {p.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                Duration
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 7].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`flex-1 py-1 rounded-md text-[9px] font-mono border transition-all ${
                      durationDays === d
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                        : 'bg-canvas-950 text-zinc-500 border-white/[0.04] hover:text-zinc-300'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time Schedule */}
          <div className="space-y-1.5 p-2 rounded-xl bg-canvas-950 border border-white/[0.06]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="flex items-center justify-between pt-1 text-[9px] font-mono">
              <span className="text-zinc-500">Quick time:</span>
              <div className="flex items-center gap-1">
                {['11:30', '14:00', '18:30', '21:00'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDueTime(preset)}
                    className={`px-1.5 py-0.5 rounded border transition-all ${
                      dueTime === preset 
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold' 
                        : 'bg-zinc-900 text-zinc-400 border-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                {dueTime && (
                  <button
                    type="button"
                    onClick={() => setDueTime('')}
                    className="text-zinc-500 hover:text-rose-400 px-1"
                    title="No specific time"
                  >
                    None
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="pt-1">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Add subtask..."
                className="flex-1 px-2.5 py-1 text-[11px] bg-canvas-950 border border-white/[0.08] rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="mt-1.5 space-y-1 max-h-20 overflow-y-auto">
                {subtasks.map(s => (
                  <div key={s.id} className="text-[10px] text-zinc-300 flex items-center justify-between bg-canvas-950 px-2 py-0.5 rounded">
                    <span>• {s.title}</span>
                    <button 
                      type="button" 
                      onClick={() => setSubtasks(subtasks.filter(item => item.id !== s.id))}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition-all active:scale-95 font-mono shadow-sm shadow-emerald-500/20"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
