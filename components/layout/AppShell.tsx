'use client';

// ==============================================================================
// MEETWISE AI — APPLICATION SHELL & RESPONSIVE SAAS LAYOUT
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  UploadCloud,
  Dna,
  Radio,
  CheckSquare,
  MessageSquare,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Bell,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { WeeklyDigestModal } from '@/components/tasks/WeeklyDigestModal';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    isLive: boolean;
    activeConflicts: number;
    pendingApprovals: number;
  }>({
    isLive: false,
    activeConflicts: 2,
    pendingApprovals: 3,
  });

  // Fetch status metrics periodically or on mount
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (data.success && data.status) {
          setSystemStatus({
            isLive: data.status.mode === 'live',
            activeConflicts: data.metrics?.activeConflicts ?? 2,
            pendingApprovals: data.metrics?.pendingApprovals ?? 3,
          });
        }
      } catch (e) {
        // Fallback to initial state
      }
    }
    loadStatus();
  }, [pathname]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      badge: null,
    },
    {
      name: 'Upload Meeting',
      href: '/upload',
      icon: UploadCloud,
      highlight: true,
      badge: null,
    },
    {
      name: 'Decision Memory',
      href: '/decisions',
      icon: Dna,
      badge: null,
    },
    {
      name: 'Conflict Radar',
      href: '/conflicts',
      icon: Radio,
      badge: systemStatus.activeConflicts > 0 ? systemStatus.activeConflicts : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'Tasks & Commitments',
      href: '/tasks',
      icon: CheckSquare,
      badge: systemStatus.pendingApprovals > 0 ? systemStatus.pendingApprovals : null,
      badgeColor: 'bg-brand-600 text-white',
    },
    {
      name: 'Ask Meeting Memory',
      href: '/memory',
      icon: MessageSquare,
      badge: 'AI',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-200/80 shadow-subtle z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MEETWISE</span>
                <span className="text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Team Meteor</p>
            </div>
          </Link>
        </div>

        {/* Workspace Pill */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Current Workspace
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                N
              </div>
              <span className="text-sm font-semibold text-slate-800">NovaTech Product</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Demo
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-900 text-white shadow-sm'
                    : item.highlight
                    ? 'bg-brand-50 text-brand-700 hover:bg-brand-100/70 border border-brand-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-cyan-400'
                        : item.highlight
                        ? 'text-brand-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Signature Features Footer Badge */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-slate-900 to-brand-950 text-white shadow-elevated">
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold tracking-wide uppercase text-cyan-300">
              Active Radar
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Decision DNA & Conflict Radar monitoring all team commitments.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hackathon Build</span>
            <span className="text-emerald-400 font-mono">v1.0-READY</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-subtle z-20">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-800">
                MEETWISE AI
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                From Conversations to Completed Actions
              </p>
            </div>
          </div>

          {/* Top Bar Actions & Indicators */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Environment Status Badge */}
            <Link
              href="/settings"
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                systemStatus.isLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus.isLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="hidden md:inline">
                {systemStatus.isLive
                  ? '⚡ Live Gemini API Connected'
                  : '🛡️ Interactive Demo Mode Active'}
              </span>
              <span className="md:hidden">{systemStatus.isLive ? 'Live AI' : 'Demo Mode'}</span>
            </Link>

            {/* Weekly Digest Action */}
            <button
              onClick={() => setIsDigestOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Weekly Digest</span>
            </button>

            {/* Quick Upload CTA */}
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Process Meeting</span>
            </Link>

            {/* Team Avatars */}
            <div className="hidden xl:flex items-center -space-x-1.5 pl-2 border-l border-slate-200">
              <div
                className="w-7 h-7 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white"
                title="David (PM)"
              >
                D
              </div>
              <div
                className="w-7 h-7 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white"
                title="Alex (Frontend)"
              >
                A
              </div>
              <div
                className="w-7 h-7 rounded-full bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white"
                title="Sarah (QA)"
              >
                S
              </div>
              <div
                className="w-7 h-7 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white"
                title="Emma (Design)"
              >
                E
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full flex flex-col p-4 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-lg text-slate-900">MEETWISE AI</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== null && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* SCROLLABLE MAIN BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* WEEKLY DIGEST MODAL */}
      {isDigestOpen && <WeeklyDigestModal onClose={() => setIsDigestOpen(false)} />}
    </div>
  );
}
