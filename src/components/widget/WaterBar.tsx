import React from 'react';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import { sfx } from '../../services/audio';
import confetti from 'canvas-confetti';

interface WaterBarProps {
  currentMl: number;
  targetMl: number;
  onAddWater: (amountMl: number) => void;
  onResetWater?: () => void;
  compact?: boolean;
}

export const WaterBar: React.FC<WaterBarProps> = ({
  currentMl,
  targetMl,
  onAddWater,
  onResetWater,
  compact = false,
}) => {
  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const isGoalReached = currentMl >= targetMl;

  const handleAdd = (amount: number) => {
    sfx.playWaterDrop();
    onAddWater(amount);

    if (currentMl + amount >= targetMl && !isGoalReached) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f2fe', '#4facfe', '#00c6ff']
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-deck-900/60 rounded-xl border border-sky-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Droplets className="w-3.5 h-3.5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200">{currentMl} ml</span>
              <span className="text-[10px] text-slate-400">/ {targetMl / 1000}L</span>
            </div>
            <div className="w-24 h-1.5 bg-deck-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAdd(250)}
            title="Log 250ml glass"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            250ml
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-gradient-to-b from-sky-950/20 to-deck-900/70 rounded-2xl border border-sky-500/25 shadow-[0_4px_20px_rgba(56,189,248,0.12)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wide flex items-center gap-2">
              Daily Hydration
              {isGoalReached && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Goal reached
                </span>
              )}
            </h4>
            <p className="text-[10px] text-sky-400/80 font-mono">
              Target: {(targetMl / 1000).toFixed(1)}L per day
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold font-mono text-cyan-300">
            {currentMl} <span className="text-[10px] text-slate-400 font-normal">ml</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {percentage}% completed
          </div>
        </div>
      </div>

      {/* Progress Tube */}
      <div className="relative h-2.5 w-full bg-deck-950/80 rounded-full overflow-hidden p-0.5 border border-sky-500/20 mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-500 relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => handleAdd(250)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 text-sky-300 border border-sky-500/25 text-xs font-mono font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            +250 ml <span className="text-[10px] opacity-60">(Glass)</span>
          </button>
          <button
            onClick={() => handleAdd(500)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-300 border border-cyan-500/25 text-xs font-mono font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            +500 ml <span className="text-[10px] opacity-60">(Bottle)</span>
          </button>
        </div>
        {onResetWater && currentMl > 0 && (
          <button
            onClick={onResetWater}
            title="Reset today's water"
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-deck-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
