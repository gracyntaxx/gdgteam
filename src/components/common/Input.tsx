'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full text-left font-ember">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-semibold text-[#8c8c94] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-[#0f141a] border ${
          error ? 'border-[#d9383a]' : 'border-[#343d4d]'
        } text-white text-[14px] px-3 py-2 rounded-[4px] placeholder-[#687078] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] transition-colors ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-[11px] text-[#ff6b6b]">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-[#687078]">{helperText}</span>
      ) : null}
    </div>
  );
};
