'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, PlusCircle, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create', label: 'Create Event', icon: PlusCircle },
    { href: '/events/demo-bhopal-30th-birthday', label: 'Demo Celebration', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5DDD3] bg-[#FAF7F2]/90 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A43] rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2D5A43] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#182620]">
              Gatherly<span className="text-[#C85A32]">.ai</span>
            </span>
            <span className="hidden sm:block text-[10px] text-[#5C6E64] font-medium tracking-wide">
              Every celebration, thoughtfully planned.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8F0EB] text-[#1F3E2E]'
                    : 'text-[#4A5950] hover:text-[#182620] hover:bg-[#F2ECE4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Status */}
        <div className="hidden sm:flex items-center gap-3">
          <Badge variant="sage" size="sm" className="hidden lg:inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A43]" />
            Offline-First V1
          </Badge>
          <Link href="/create">
            <Button size="sm" variant="accent" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Plan an Event
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/create">
            <Button size="sm" variant="accent" className="px-2.5 py-1 text-xs">
              + Plan
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-[#182620] hover:bg-[#F2ECE4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A43]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5DDD3] bg-[#FAF7F2] px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8F0EB] text-[#1F3E2E]'
                    : 'text-[#4A5950] hover:text-[#182620] hover:bg-[#F2ECE4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#E5DDD3]">
            <p className="text-xs text-[#5C6E64] px-3 py-1">
              Data saved securely in your browser with JSON backup export.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
