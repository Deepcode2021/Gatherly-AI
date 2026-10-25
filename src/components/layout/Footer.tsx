import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5DDD3] bg-[#FAF7F2] py-10 text-[#4A5950] text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2D5A43] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
              </div>
              <span className="text-base font-bold text-[#182620]">
                Gatherly<span className="text-[#C85A32]">.ai</span>
              </span>
            </div>
            <p className="text-xs text-[#5C6E64] max-w-md leading-relaxed">
              Every celebration, thoughtfully planned. AI-assisted workspaces for weddings, birthdays, anniversaries, college fests, and community gatherings across India and beyond.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#5C6E64]">
              <Shield className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span>Offline-first local storage. Your event data never leaves your device unless you choose to export it.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-[#182620] uppercase tracking-wider mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-[#182620] transition-colors">
                  Planning Dashboard
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-[#182620] transition-colors">
                  Create New Event
                </Link>
              </li>
              <li>
                <Link href="/events/demo-bhopal-30th-birthday" className="hover:text-[#182620] transition-colors">
                  Bhopal 30th Birthday Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* PromptWars Info */}
          <div>
            <h3 className="text-xs font-semibold text-[#182620] uppercase tracking-wider mb-3">
              Hackathon Context
            </h3>
            <p className="text-xs text-[#5C6E64] leading-relaxed mb-2">
              Built for <strong className="text-[#182620]">PromptWars Virtual — Challenge 5: Celebration & Event Planner</strong> using Next.js 16 and Google Gemini 2.5 Flash.
            </p>
            <p className="text-[11px] text-[#5C6E64]">
              Deterministic INR calculations • WCAG 2.2 AA compliant.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5DDD3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C6E64] gap-2">
          <p>© {new Date().getFullYear()} Gatherly AI. Built with precision and celebratory warmth.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-current" />
            <span>for Indian & Global celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
