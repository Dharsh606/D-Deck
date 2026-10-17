import React from 'react';

interface DDeckLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const DDeckLogo: React.FC<DDeckLogoProps> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { box: 'w-6 h-6', font: 'text-xs', label: 'text-xs' },
    md: { box: 'w-7 h-7', font: 'text-sm', label: 'text-sm' },
    lg: { box: 'w-10 h-10', font: 'text-base', label: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`relative ${current.box} rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-sm`}>
        <span className={`font-mono font-bold text-zinc-100 ${current.font}`}>
          D
        </span>
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`font-semibold text-zinc-100 tracking-tight font-sans ${current.label}`}>
          D-Deck
        </span>
      </div>
    </div>
  );
};
