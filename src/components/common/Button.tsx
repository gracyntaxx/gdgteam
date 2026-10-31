'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium font-ember rounded-[4px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-[12px] px-2.5 py-1 gap-1.5 min-h-[28px]',
    md: 'text-[14px] px-4 py-2 gap-2 min-h-[36px]',
    lg: 'text-[16px] px-6 py-2.5 gap-2.5 min-h-[44px]',
  };

  const variantStyles = {
    primary:
      'bg-[#ff9900] text-[#16191f] hover:bg-[#ec8c00] active:bg-[#d88000] font-semibold shadow-sm',
    secondary:
      'bg-[#232b37] text-white hover:bg-[#2c3645] border border-[#343d4d]',
    outline:
      'bg-transparent text-white border border-[#687078] hover:border-white hover:bg-white/5',
    accent:
      'bg-[#7300e5] text-white hover:bg-[#6000c2] shadow-sm',
    ghost:
      'bg-transparent text-[#687078] hover:text-white hover:bg-white/5',
    danger:
      'bg-[#d9383a] text-white hover:bg-[#b82d2f]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
