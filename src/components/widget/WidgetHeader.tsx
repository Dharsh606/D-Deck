import React from 'react';
import { Plus, Maximize2, Pin, PinOff, Minus, X } from 'lucide-react';
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
    <div className="titlebar-drag flex items-center justify-between px-3.5 py-2.5 bg-canvas-950/90 border-b border-white/[0.06] rounded-t-2xl cursor-move select-none">
      <div className="titlebar-no-drag">
        <DDeckLogo size="sm" />
      </div>

      <div className="titlebar-no-drag flex items-center gap-1">
        {/* Quick Add */}
        <button
          onClick={() => {
            sfx.playClick();
            onQuickAdd();
          }}
          title="Add Task (+)"
          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] transition-all active:scale-95"
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
          className={`p-1.5 rounded-lg transition-all ${
            alwaysOnTop 
              ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          {alwaysOnTop ? <Pin className="w-3.5 h-3.5 fill-indigo-400/20" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        {/* Full View */}
        <button
          onClick={() => {
            sfx.playClick();
            onExpandToDeck();
          }}
          title="Full View"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
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
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
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
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
