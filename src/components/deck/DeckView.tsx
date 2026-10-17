import React, { useState } from 'react';
import type { Task, TaskCategory, DailyWaterData, AppSettings } from '../../types';
import { CATEGORIES, getCategoryTheme } from '../../constants/categories';
import { DDeckLogo } from '../common/DDeckLogo';
import { TaskItem } from '../widget/TaskItem';
import { WaterBar } from '../widget/WaterBar';
import { QuickAddModal } from '../widget/QuickAddModal';
import { 
  LayoutDashboard, 
  Code2, 
  FolderGit2, 
  Gamepad2, 
  Film, 
  Droplets, 
  Flame, 
  CheckSquare, 
  Settings as SettingsIcon, 
  Minimize2, 
  Plus, 
  Search, 
  Download, 
  Bell, 
  Volume2, 
  Power,
  Minus,
  X
} from 'lucide-react';
import { sfx } from '../../services/audio';
import { exportDataAsJSON } from '../../services/storage';

interface DeckViewProps {
  tasks: Task[];
  waterData?: DailyWaterData;
  settings: AppSettings;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddWater: (amountMl: number) => void;
  onResetWater?: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSwitchToWidget: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const DeckView: React.FC<DeckViewProps> = ({
  tasks,
  waterData,
  settings,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
  onAddWater,
  onResetWater,
  onUpdateSettings,
  onSwitchToWidget,
  onMinimize,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const urgentTasksCount = tasks.filter(t => !t.completed && t.priority === 'urgent').length;
  const overdueTasksCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const filteredTasks = tasks.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    if (activeTab === 'overview') return true;
    if (activeTab === 'settings') return true;
    if (activeTab === 'water') return false;
    return t.category === activeTab;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'daily', label: 'Daily', icon: CheckSquare },
    { id: 'fitness', label: 'Fitness', icon: Flame },
    { id: 'water', label: 'Water Tracker', icon: Droplets },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-[1080px] h-[740px] flex glass-surface rounded-2xl overflow-hidden font-sans select-none">
      
      {/* Sidebar */}
      <div className="w-56 bg-canvas-950/90 border-r border-white/[0.06] flex flex-col justify-between p-3.5">
        <div>
          <div className="titlebar-drag pb-3 mb-3 border-b border-white/[0.06] cursor-move">
            <DDeckLogo size="md" />
          </div>

          <nav className="space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const count = item.id === 'overview' 
                ? pendingTasksCount 
                : item.id === 'water' || item.id === 'settings' 
                ? null 
                : tasks.filter(t => t.category === item.id && !t.completed).length;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sfx.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 font-semibold border border-white/[0.08]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {count !== null && count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-white/[0.04]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <button
            onClick={() => {
              sfx.playClick();
              onSwitchToWidget();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] text-xs font-mono transition-all active:scale-95"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Widget Mode
          </button>
          
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
            <span>D-Deck v1.0</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Offline
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col bg-canvas-950/40 overflow-hidden">
        
        {/* Top Header */}
        <div className="titlebar-drag px-6 py-3 border-b border-white/[0.06] flex items-center justify-between bg-canvas-950/80 cursor-move">
          
          <div className="titlebar-no-drag flex items-center gap-2 bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 text-xs">
                ×
              </button>
            )}
          </div>

          <div className="titlebar-no-drag flex items-center gap-2">
            <button
              onClick={() => {
                sfx.playClick();
                setIsQuickAddOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all active:scale-95 font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            <button
              onClick={onMinimize}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Bento Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-canvas-850/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Pending</span>
                  <div className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{pendingTasksCount}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{completedTasksCount} done</div>
                </div>

                <div className="p-4 rounded-xl bg-canvas-850/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Urgent</span>
                  <div className="text-2xl font-semibold font-mono text-zinc-100 mt-1">{urgentTasksCount}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{overdueTasksCount} overdue</div>
                </div>

                <div className="p-4 rounded-xl bg-canvas-850/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">Water</span>
                  <div className="text-2xl font-semibold font-mono text-zinc-100 mt-1">
                    {waterData?.currentMl || 0} <span className="text-xs text-zinc-500 font-normal">ml</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Goal: {(settings.waterTargetMl / 1000).toFixed(1)}L</div>
                </div>

                <div className="p-4 rounded-xl bg-canvas-850/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Progress</span>
                  <div className="text-2xl font-semibold font-mono text-zinc-100 mt-1">
                    {totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">{totalTasks} total tasks</div>
                </div>
              </div>

              {/* Water Card */}
              <WaterBar
                currentMl={waterData?.currentMl || 0}
                targetMl={settings.waterTargetMl || 3500}
                onAddWater={onAddWater}
                onResetWater={onResetWater}
              />

              {/* Tasks List */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider mb-2.5">
                  Tasks ({filteredTasks.filter(t => !t.completed).length})
                </h3>

                {filteredTasks.filter(t => !t.completed).length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 bg-canvas-850/40 rounded-xl border border-white/[0.04]">
                    No active tasks. Click Add Task to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredTasks.filter(t => !t.completed).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onToggleSubtask={onToggleSubtask}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {activeTab !== 'overview' && activeTab !== 'water' && activeTab !== 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100 capitalize">
                    {getCategoryTheme(activeTab).label}
                  </h2>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-white/[0.08] text-xs font-mono hover:bg-zinc-700 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to {getCategoryTheme(activeTab).label}
                </button>
              </div>

              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 bg-canvas-850/40 rounded-xl border border-white/[0.04]">
                    No tasks in {getCategoryTheme(activeTab).label}.
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onToggleSubtask={onToggleSubtask}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Water Tracker Tab */}
          {activeTab === 'water' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Water Tracker</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Daily water intake log and history.</p>
              </div>

              <WaterBar
                currentMl={waterData?.currentMl || 0}
                targetMl={settings.waterTargetMl || 3500}
                onAddWater={onAddWater}
                onResetWater={onResetWater}
              />

              <div className="p-4 rounded-xl bg-canvas-850/80 border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                  Today's Logs ({waterData?.entries?.length || 0})
                </h4>
                {(!waterData?.entries || waterData.entries.length === 0) ? (
                  <p className="text-xs text-zinc-500">No water logged yet today.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {waterData.entries.map((entry, idx) => (
                      <div key={entry.id || idx} className="p-2 rounded-lg bg-canvas-950 border border-white/[0.06] text-xs flex items-center justify-between">
                        <span className="font-mono text-sky-400">+{entry.amountMl}ml</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{entry.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-xl">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Settings</h2>
                <p className="text-xs text-zinc-400 mt-0.5">General preferences and local data management.</p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3.5 rounded-xl bg-canvas-850/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Start with Windows</h4>
                      <p className="text-[11px] text-zinc-400">Launch widget on desktop login.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.startupOnBoot}
                    onChange={e => onUpdateSettings({ startupOnBoot: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-canvas-850/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Desktop Notifications</h4>
                      <p className="text-[11px] text-zinc-400">Alert for overdue tasks and water reminders.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={e => onUpdateSettings({ notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-canvas-850/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Audio Feedback</h4>
                      <p className="text-[11px] text-zinc-400">Short sound effect on completion and water logs.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-canvas-850/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Export Local Data</h4>
                      <p className="text-[11px] text-zinc-400">Export tasks and water logs to JSON.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportDataAsJSON({ tasks, waterHistory: { [todayStr]: waterData || { date: todayStr, currentMl: 0, targetMl: 3500, entries: [] } }, settings })}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] text-xs font-mono transition-all"
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={onAddTask}
        initialCategory={activeTab === 'overview' || activeTab === 'water' || activeTab === 'settings' ? 'coding' : activeTab}
      />
    </div>
  );
};
