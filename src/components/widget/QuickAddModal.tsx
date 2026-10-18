import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar, Clock, Repeat } from 'lucide-react';
import type { Task, TaskCategory, TaskPriority } from '../../types';
import { sfx } from '../../services/audio';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialCategory?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialCategory = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(initialCategory);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState<string>('11:30');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isRoutine, setIsRoutine] = useState<boolean>(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setCategory(initialCategory);
      setIsRoutine(false);
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
      isRoutine,
      lastResetDate: isRoutine ? dueDate : undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm max-h-[94vh] glass-surface-panel border border-white/[0.14] rounded-2xl shadow-2xl p-4 overflow-y-auto relative scrollbar-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-xs font-semibold text-zinc-100 tracking-wide">
            New Task
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/[0.08] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 font-sans">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 text-xs glass-input rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all font-medium"
            />
          </div>

          <div>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes or details..."
              className="w-full px-3 py-1.5 text-[11px] glass-input rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none transition-all font-normal"
            />
          </div>

          {/* Manual Category / Tag Field */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1 tracking-wide">
              Category / Tag <span className="text-zinc-500 font-normal text-[10px]">(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Gaming, Coding, Project, Workout, Client..."
              className="w-full px-3 py-2 text-xs glass-input rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Priority
              </label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 rounded-lg text-[9px] uppercase transition-all border ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : p === 'high'
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
                          : p === 'medium'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-zinc-200 text-zinc-950 border-zinc-200 font-bold'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200'
                    }`}
                  >
                    {p.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Duration
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 7].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      durationDays === d
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time Schedule */}
          <div className="space-y-2 p-3 rounded-xl glass-card border border-white/[0.08]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full glass-input rounded-lg px-2.5 py-1 text-[11px] text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full glass-input rounded-lg px-2.5 py-1 text-[11px] text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="flex items-center justify-between pt-1 text-[10px]">
              <span className="text-zinc-400">Quick time:</span>
              <div className="flex items-center gap-1 font-mono">
                {['11:30', '14:00', '18:30', '21:00'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDueTime(preset)}
                    className={`px-1.5 py-0.5 rounded-md border text-[9px] transition-all ${
                      dueTime === preset 
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold' 
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                {dueTime && (
                  <button
                    type="button"
                    onClick={() => setDueTime('')}
                    className="text-zinc-400 hover:text-rose-400 px-1 text-[10px]"
                    title="No specific time"
                  >
                    None
                  </button>
                )}
              </div>
            </div>

            {/* Daily Routine Auto-Reset Toggle */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Repeat className={`w-3.5 h-3.5 ${isRoutine ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span className="text-[11px] text-zinc-200 font-medium">Daily Routine</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRoutine}
                  onChange={e => setIsRoutine(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-400 rounded cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400">Auto-resets at midnight</span>
              </label>
            </div>
          </div>

          {/* Subtasks */}
          <div>
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
                className="flex-1 px-3 py-1.5 text-[11px] glass-input rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 rounded-xl text-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="mt-1.5 space-y-1 max-h-20 overflow-y-auto pr-1">
                {subtasks.map(s => (
                  <div key={s.id} className="text-[10px] text-zinc-200 flex items-center justify-between glass-card px-2.5 py-1 rounded-lg">
                    <span>• {s.title}</span>
                    <button 
                      type="button" 
                      onClick={() => setSubtasks(subtasks.filter(item => item.id !== s.id))}
                      className="text-zinc-400 hover:text-rose-400 font-mono text-xs px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition-all active:scale-95 shadow-sm shadow-emerald-500/20"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
