'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'interactive' | 'outline';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-[4px] transition-all duration-150';
  const paddingStyles = noPadding ? '' : 'p-4';

  const variantStyles = {
    default:
      'bg-[#1b222d] border border-[#232b37] text-white shadow-[0px_4px_20px_1px_rgba(0,7,22,0.1)]',
    surface:
      'bg-[#232b37] border border-[#343d4d] text-white',
    interactive:
      'bg-[#1b222d] border border-[#232b37] hover:border-[#ff9900]/70 hover:shadow-[0px_4px_24px_rgba(255,153,0,0.1)] cursor-pointer text-white',
    outline:
      'bg-transparent border border-[#343d4d] text-white',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
