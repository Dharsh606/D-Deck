import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
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
  const [durationDays, setDurationDays] = useState<number>(1);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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
      durationDays,
      reminderEnabled: true,
      subtasks,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-deck-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-deck-900 border border-slate-700/60 rounded-2xl shadow-2xl p-4 overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">
              Quick Add Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-deck-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {/* Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              className="w-full px-3 py-2 text-xs bg-deck-950/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/80 transition-all"
            />
          </div>

          {/* Optional Short Description */}
          <div>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes, links, or instructions (optional)..."
              className="w-full px-3 py-1.5 text-[11px] bg-deck-950/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 resize-none transition-all"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">
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
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-medium font-mono text-center border transition-all ${
                      isSelected
                        ? `${cat.borderColor} ${cat.bgGlow}`
                        : 'border-slate-800 text-slate-400 hover:border-slate-700 bg-deck-950/40'
                    }`}
                  >
                    {cat.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Duration row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 tracking-wider">
                Priority
              </label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-mono uppercase font-bold border transition-all ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : p === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-deck-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    {p.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 tracking-wider">
                Duration (Days)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 7].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      durationDays === d
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
                        : 'bg-deck-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-deck-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Subtask input */}
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
                placeholder="+ Add checklist step..."
                className="flex-1 px-2.5 py-1 text-[11px] bg-deck-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="mt-1.5 space-y-1 max-h-20 overflow-y-auto">
                {subtasks.map(s => (
                  <div key={s.id} className="text-[10px] text-slate-300 flex items-center justify-between bg-deck-950/40 px-2 py-0.5 rounded">
                    <span>• {s.title}</span>
                    <button 
                      type="button" 
                      onClick={() => setSubtasks(subtasks.filter(item => item.id !== s.id))}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-deck-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wide bg-gradient-to-r from-cyan-400 to-blue-600 text-deck-950 hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] disabled:opacity-50 transition-all active:scale-95"
            >
              ADD TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
