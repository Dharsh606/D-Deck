import React from 'react';
import { Plus, Maximize2, Pin, PinOff, Minus, X, Droplets } from 'lucide-react';
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

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  onQuickAdd,
  onExpandToDeck,
  alwaysOnTop,
  onToggleAlwaysOnTop,
  onMinimize,
  onClose,
}) => {
  return (
    <div className="titlebar-drag flex items-center justify-between px-3.5 py-2.5 bg-deck-950/90 border-b border-slate-800/80 rounded-t-2xl cursor-move select-none">
      {/* Brand & Status */}
      <div className="titlebar-no-drag">
        <DDeckLogo size="sm" />
      </div>

      {/* Action Controls */}
      <div className="titlebar-no-drag flex items-center gap-1">
        {/* Quick Add Button */}
        <button
          onClick={() => {
            sfx.playClick();
            onQuickAdd();
          }}
          title="Quick Add Task (+)"
          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.25)] transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Pin / Always-on-top toggle */}
        <button
          onClick={() => {
            sfx.playClick();
            onToggleAlwaysOnTop();
          }}
          title={alwaysOnTop ? "Pinned (Always on top)" : "Unpinned"}
          className={`p-1.5 rounded-lg transition-all ${
            alwaysOnTop 
              ? 'text-cyan-400 bg-cyan-500/10' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-deck-800'
          }`}
        >
          {alwaysOnTop ? <Pin className="w-3.5 h-3.5 fill-cyan-400/20" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        {/* Expand to Full Deck */}
        <button
          onClick={() => {
            sfx.playClick();
            onExpandToDeck();
          }}
          title="Expand to Full Command Deck"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-deck-800 transition-all"
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-deck-800 transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close / Hide to Tray */}
        <button
          onClick={() => {
            sfx.playClick();
            onClose();
          }}
          title="Close / Hide to Tray"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
