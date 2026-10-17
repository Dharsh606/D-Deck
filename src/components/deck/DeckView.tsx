import React, { useState } from 'react';
import type { Task, TaskCategory, DailyWaterData, AppSettings } from '../../types';
import { CATEGORIES, getCategoryConfig } from '../../constants/categories';
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
  X,
  ExternalLink
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

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const urgentTasksCount = tasks.filter(t => !t.completed && t.priority === 'urgent').length;
  const overdueTasksCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const filteredTasks = tasks.filter(t => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Tab filter
    if (activeTab === 'overview') return true;
    if (activeTab === 'settings') return true;
    if (activeTab === 'water') return false;
    return t.category === activeTab;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: '#00f2fe' },
    { id: 'coding', label: 'Coding & Tech', icon: Code2, color: '#00f2fe' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, color: '#f43f5e' },
    { id: 'gaming', label: 'Gaming Backlog', icon: Gamepad2, color: '#b827fc' },
    { id: 'movies', label: 'Movies', icon: Film, color: '#fbbf24' },
    { id: 'daily', label: 'Daily Activities', icon: CheckSquare, color: '#6366f1' },
    { id: 'fitness', label: 'Fitness & Health', icon: Flame, color: '#10b981' },
    { id: 'water', label: 'Water Tracker', icon: Droplets, color: '#38bdf8' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, color: '#94a3b8' },
  ];

  return (
    <div className="w-[1120px] h-[760px] flex glass-panel rounded-2xl shadow-deck-card border border-slate-700/60 overflow-hidden font-['Outfit'] select-none">
      
      {/* Left Sidebar */}
      <div className="w-64 bg-deck-950/90 border-r border-slate-800/80 flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <div className="titlebar-drag pb-4 mb-4 border-b border-slate-800/80 cursor-move">
            <DDeckLogo size="md" />
            <p className="text-[11px] text-slate-400 mt-1 pl-1">Desktop Tasks & Habits</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-deck-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#00f2fe' : item.color }} />
                    <span>{item.label}</span>
                  </div>
                  {count !== null && count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-deck-850 text-slate-300 border border-slate-700/60">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {/* Switch to Compact Widget Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onSwitchToWidget();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-deck-900 hover:bg-deck-850 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold transition-all shadow-[0_0_10px_rgba(0,242,254,0.1)] active:scale-95"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Switch to Widget Mode
          </button>
          
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
            <span>D-Deck v1.0.0</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Offline Local
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-deck-950/40 overflow-hidden">
        
        {/* Top Navbar */}
        <div className="titlebar-drag px-6 py-3 border-b border-slate-800/80 flex items-center justify-between bg-deck-950/80 cursor-move">
          
          {/* Search Bar */}
          <div className="titlebar-no-drag flex items-center gap-2 bg-deck-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, movies, games, tags..."
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300 text-xs">
                ×
              </button>
            )}
          </div>

          {/* Quick Actions & Window Controls */}
          <div className="titlebar-no-drag flex items-center gap-2">
            <button
              onClick={() => {
                sfx.playClick();
                setIsQuickAddOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-deck-950 font-bold text-xs shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:brightness-110 transition-all active:scale-95 font-mono"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              ADD TASK
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={onMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-deck-900 transition-all"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Close to Tray"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Overview Dashboard Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-deck-900/60 border border-cyan-500/20 shadow-[0_4px_16px_rgba(0,242,254,0.08)]">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Pending Tasks</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{pendingTasksCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{completedTasksCount} completed total</div>
                </div>

                <div className="p-4 rounded-2xl bg-deck-900/60 border border-rose-500/20 shadow-[0_4px_16px_rgba(244,63,94,0.08)]">
                  <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">Urgent Tasks</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{urgentTasksCount}</div>
                  <div className="text-[11px] text-rose-400/80 mt-1">{overdueTasksCount} overdue tasks</div>
                </div>

                <div className="p-4 rounded-2xl bg-deck-900/60 border border-sky-500/20 shadow-[0_4px_16px_rgba(56,189,248,0.08)]">
                  <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">Water Logged</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {waterData?.currentMl || 0} <span className="text-sm text-slate-400 font-normal">ml</span>
                  </div>
                  <div className="text-[11px] text-sky-400/80 mt-1">Goal: {settings.waterTargetMl / 1000}L / day</div>
                </div>

                <div className="p-4 rounded-2xl bg-deck-900/60 border border-emerald-500/20 shadow-[0_4px_16px_rgba(16,185,129,0.08)]">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Completion Rate</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-1">Overall tasks</div>
                </div>
              </div>

              {/* Water Intake Section */}
              <WaterBar
                currentMl={waterData?.currentMl || 0}
                targetMl={settings.waterTargetMl || 3500}
                onAddWater={onAddWater}
                onResetWater={onResetWater}
              />

              {/* Active Tasks Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-200 tracking-wide">
                    Active Tasks ({filteredTasks.filter(t => !t.completed).length})
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
              </div>
            </div>
          )}

          {/* Category-Specific Views (Coding, Gaming, Movies, Projects, Daily, Fitness) */}
          {activeTab !== 'overview' && activeTab !== 'water' && activeTab !== 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 capitalize font-['Outfit']">
                    {getCategoryConfig(activeTab).label}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {getCategoryConfig(activeTab).description}
                  </p>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-mono hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to {getCategoryConfig(activeTab).label.split(' ')[0]}
                </button>
              </div>

              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-deck-900/40 rounded-2xl border border-slate-800">
                    No tasks yet in {getCategoryConfig(activeTab).label}. Click button above to add one!
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

          {/* Water Tab */}
          {activeTab === 'water' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Water Tracker</h2>
                <p className="text-xs text-slate-400 mt-0.5">Daily water intake log and history.</p>
              </div>

              <WaterBar
                currentMl={waterData?.currentMl || 0}
                targetMl={settings.waterTargetMl || 3500}
                onAddWater={onAddWater}
                onResetWater={onResetWater}
              />

              {/* Water Log history */}
              <div className="p-4 rounded-2xl bg-deck-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                  Today's Logs ({waterData?.entries?.length || 0})
                </h4>
                {(!waterData?.entries || waterData.entries.length === 0) ? (
                  <p className="text-xs text-slate-500">No water logged yet today.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {waterData.entries.map((entry, idx) => (
                      <div key={entry.id || idx} className="p-2.5 rounded-xl bg-deck-950/80 border border-sky-500/20 text-xs flex items-center justify-between">
                        <span className="font-mono text-sky-400 font-bold">+{entry.amountMl}ml</span>
                        <span className="text-[10px] text-slate-400 font-mono">{entry.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">General preferences and local data management.</p>
              </div>

              <div className="space-y-4">
                {/* Auto Start on Windows boot */}
                <div className="p-4 rounded-2xl bg-deck-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Power className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Start with Windows</h4>
                      <p className="text-[11px] text-slate-400">Launch the widget on desktop login automatically.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.startupOnBoot}
                    onChange={e => onUpdateSettings({ startupOnBoot: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* Windows Native Notifications */}
                <div className="p-4 rounded-2xl bg-deck-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Desktop Notifications</h4>
                      <p className="text-[11px] text-slate-400">Show notifications for overdue tasks and daily water reminders.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={e => onUpdateSettings({ notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* Sound Effects */}
                <div className="p-4 rounded-2xl bg-deck-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Audio Feedback</h4>
                      <p className="text-[11px] text-slate-400">Play short click and completion tones.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* Export Local Data */}
                <div className="p-4 rounded-2xl bg-deck-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Export Local Data</h4>
                      <p className="text-[11px] text-slate-400">Save current tasks and logs to a JSON file.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportDataAsJSON({ tasks, waterHistory: { [todayStr]: waterData || { date: todayStr, currentMl: 0, targetMl: 3500, entries: [] } }, settings })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono hover:bg-emerald-500/25 transition-all"
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={onAddTask}
        initialCategory={activeTab === 'overview' || activeTab === 'water' || activeTab === 'settings' ? 'coding' : activeTab}
      />
    </div>
  );
};
