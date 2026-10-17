import React from 'react';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import { sfx } from '../../services/audio';

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
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-canvas-850/80 rounded-xl border border-white/[0.06] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs font-semibold text-zinc-100">{currentMl} ml</span>
              <span className="text-[10px] text-zinc-500">/ {(targetMl / 1000).toFixed(1)}L</span>
            </div>
            <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-300 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAdd(250)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-white/[0.06] transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            250ml
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-canvas-850/80 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-zinc-200">Daily Water</h4>
              {isGoalReached && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                  Goal reached
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Target: {(targetMl / 1000).toFixed(1)} Liters
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-sm font-semibold text-zinc-100">
            {currentMl} <span className="text-[10px] text-zinc-500 font-normal">ml</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Tube */}
      <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden mb-3.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => handleAdd(250)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-200 border border-white/[0.06] text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            250ml
          </button>
          <button
            onClick={() => handleAdd(500)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-200 border border-white/[0.06] text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            500ml
          </button>
        </div>
        {onResetWater && currentMl > 0 && (
          <button
            onClick={onResetWater}
            title="Reset water log"
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
