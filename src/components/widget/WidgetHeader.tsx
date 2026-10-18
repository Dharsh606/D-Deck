import React, { useState, useEffect } from 'react';
import { Plus, Maximize2, Pin, PinOff, Minus, X, Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { DDeckLogo } from '../common/DDeckLogo';
import { sfx } from '../../services/audio';

interface WidgetHeaderProps {
  onQuickAdd: () => void;
  onExpandToDeck: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

const SPRINT_PRESETS = [25, 45, 15, 60]; // in minutes

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  onQuickAdd,
  onExpandToDeck,
  alwaysOnTop,
  onToggleAlwaysOnTop,
  onMinimize,
  onClose,
}) => {
  // Focus Flow HUD Mini Sprint Timer state
  const [presetIndex, setPresetIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SPRINT_PRESETS[0] * 60);
  const [isRunning, setIsRunning] = useState(false);

  const currentPresetMins = SPRINT_PRESETS[presetIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            sfx.playReminderChime();
            if (window.electronAPI) {
              window.electronAPI.showNotification(
                'Focus Flow Sprint Complete!',
                `Your ${currentPresetMins}m focus sprint has concluded. Great work! Take a break.`
              );
            }
            return currentPresetMins * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, currentPresetMins]);

  const handleCyclePreset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) return;
    sfx.playClick();
    const nextIdx = (presetIndex + 1) % SPRINT_PRESETS.length;
    setPresetIndex(nextIdx);
    setSecondsLeft(SPRINT_PRESETS[nextIdx] * 60);
  };

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    setIsRunning(false);
    setSecondsLeft(currentPresetMins * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="titlebar-drag flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/[0.08] rounded-t-2xl cursor-move select-none">
      <div className="titlebar-no-drag flex items-center gap-2">
        <DDeckLogo size="sm" />
      </div>

      {/* Focus Flow HUD Mini Sprint Timer */}
      <div className="titlebar-no-drag flex items-center">
        <div 
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border transition-all text-[10px] font-mono select-none ${
            isRunning 
              ? 'bg-amber-400/10 border-amber-400/35 text-amber-300 ring-1 ring-amber-400/20 shadow-sm shadow-amber-500/10' 
              : 'glass-card text-zinc-400 hover:text-zinc-200'
          }`}
          title={isRunning ? "Sprint in Progress - Click to Pause" : "Click time to cycle presets (25m/45m/15m/60m)"}
        >
          <Timer className={`w-3 h-3 ${isRunning ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
          <button
            onClick={handleCyclePreset}
            disabled={isRunning}
            className={`font-semibold cursor-pointer ${isRunning ? 'cursor-default' : 'hover:text-amber-300'}`}
          >
            {isRunning ? formatTimer(secondsLeft) : `${currentPresetMins}m`}
          </button>

          <button
            onClick={handleToggleTimer}
            className="p-0.5 hover:text-white transition-colors"
            title={isRunning ? "Pause Sprint" : "Start Sprint"}
          >
            {isRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
          </button>

          {isRunning && (
            <button
              onClick={handleResetTimer}
              className="p-0.5 hover:text-rose-400 transition-colors"
              title="Reset Sprint"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <div className="titlebar-no-drag flex items-center gap-0.5">
        {/* Quick Add */}
        <button
          onClick={() => {
            sfx.playClick();
            onQuickAdd();
          }}
          title="Add Task (+)"
          className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Pin to Desktop / Always on Top */}
        <button
          onClick={() => {
            sfx.playClick();
            onToggleAlwaysOnTop();
          }}
          title={alwaysOnTop ? "Pinned (Always on top)" : "Unpinned"}
          className={`p-1 rounded-lg transition-all ${
            alwaysOnTop 
              ? 'text-amber-400 bg-amber-400/15 border border-amber-400/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
          }`}
        >
          {alwaysOnTop ? <Pin className="w-3.5 h-3.5 fill-amber-400/20" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        {/* Full View */}
        <button
          onClick={() => {
            sfx.playClick();
            onExpandToDeck();
          }}
          title="Full View"
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Minimize */}
        <button
          onClick={() => {
            sfx.playClick();
            onMinimize();
          }}
          title="Minimize"
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close */}
        <button
          onClick={() => {
            sfx.playClick();
            onClose();
          }}
          title="Close to Tray"
          className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
