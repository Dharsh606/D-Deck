import React from 'react';
import iconImg from '../../assets/icon.png';
import logoImg from '../../assets/logo.png';

interface DDeckLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  showText?: boolean;
}

export const DDeckLogo: React.FC<DDeckLogoProps> = ({ 
  size = 'md', 
  variant = 'icon',
  showText = true 
}) => {
  if (variant === 'full') {
    const fullSizeMap = {
      sm: 'h-8',
      md: 'h-11',
      lg: 'h-16',
    };
    return (
      <div className="flex items-center select-none">
        <img 
          src={logoImg} 
          alt="D-Deck" 
          className={`${fullSizeMap[size]} w-auto object-contain drop-shadow-md`} 
        />
      </div>
    );
  }

  const iconSizeMap = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`${iconSizeMap[size]} flex items-center justify-center flex-shrink-0`}>
        <img 
          src={iconImg} 
          alt="D" 
          className="w-full h-full object-contain drop-shadow-sm" 
        />
      </div>
      {showText && (
        <span className={`font-bold text-zinc-100 tracking-tight font-sans ${textMap[size]}`}>
          D-Deck
        </span>
      )}
    </div>
  );
};
