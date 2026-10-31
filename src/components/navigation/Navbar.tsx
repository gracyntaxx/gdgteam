'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Layers, ShoppingBag, Settings, Menu, Activity, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/', icon: Box },
    { label: '3D Workspace', href: '/workspace', icon: Layers },
    { label: 'Renovation & Catalog', href: '/renovation', icon: ShoppingBag },
  ];

  return (
    <header className="h-[56px] bg-[#16191f] border-b border-[#232b37] px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 font-ember select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[4px] bg-gradient-to-br from-[#ff9900] to-[#7300e5] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="font-bold text-[#16191f] text-lg font-mono">A</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-white tracking-tight">ArchiTech</span>
              <Badge variant="brand" size="sm">Spatial AI</Badge>
            </div>
            <span className="text-[10px] text-[#687078] leading-tight hidden sm:inline">
              AWS Builder Center Architecture
            </span>
          </div>
        </Link>

        {/* Primary Page Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#232b37] text-[#ff9900] border border-[#ff9900]/40'
                    : 'text-[#8c8c94] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right side items: Backend Status, About, Settings, Session */}
      <div className="flex items-center gap-3">
        {/* Spatial Intelligence Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#0f141a] border border-[#232b37]">
          <span className="w-2 h-2 rounded-full bg-[#00e582] animate-pulse" />
          <span className="text-[11px] text-[#8c8c94] font-mono">PURE Pi3 & YOLO11: Ready</span>
        </div>

        {/* Quick Settings */}
        <button
          title="Engine Configuration"
          className="p-2 rounded-[4px] text-[#8c8c94] hover:text-white hover:bg-[#232b37] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Session status */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#232b37]">
          <div className="w-7 h-7 rounded-full bg-[#7300e5] flex items-center justify-center text-white text-[11px] font-bold shadow-inner">
            AR
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] font-medium text-white leading-none">Architect Session</span>
            <span className="text-[10px] text-[#00e582] leading-none mt-1">Colab T4 Active</span>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button className="md:hidden p-2 rounded text-[#8c8c94] hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
