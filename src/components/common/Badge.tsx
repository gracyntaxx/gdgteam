'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium font-ember uppercase tracking-wider rounded-[2px]';
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-bold',
    md: 'text-[11px] px-2 py-0.5 font-semibold',
  };

  const variantStyles = {
    brand: 'bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/40',
    accent: 'bg-[#7300e5]/20 text-[#c285ff] border border-[#7300e5]/50',
    neutral: 'bg-[#232b37] text-[#aab2bd] border border-[#343d4d]',
    success: 'bg-[#00e582]/15 text-[#00e582] border border-[#00e582]/30',
    warning: 'bg-[#ff9900]/20 text-[#ffb03a] border border-[#ff9900]/30',
    info: 'bg-[#0073bb]/20 text-[#60b5ff] border border-[#0073bb]/40',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
