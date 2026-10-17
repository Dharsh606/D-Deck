import React from 'react';

interface DDeckLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const DDeckLogo: React.FC<DDeckLogoProps> = ({ size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl',
  };

  return (
    <div className="flex items-center gap-2.5">
      <div 
        className={`relative ${sizeClasses[size]} rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 p-[1.5px] shadow-[0_0_15px_rgba(0,242,254,0.35)] flex items-center justify-center`}
      >
        <div className="w-full h-full bg-deck-950/90 rounded-[7px] flex items-center justify-center font-black tracking-tighter text-cyan-400">
          <span className="font-mono text-base font-extrabold bg-gradient-to-b from-cyan-200 to-blue-400 bg-clip-text text-transparent">
            D
          </span>
        </div>
        {animated && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-wider font-['Outfit']">
            D-DECK
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-deck-900 text-slate-400 border border-slate-700/60">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
