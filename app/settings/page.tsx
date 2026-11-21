'use client';

// ==============================================================================
// MEETWISE AI — SETTINGS & SYSTEM CONFIGURATION
// Workspace settings, credentials status, and demo reset controls
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleResetDemo() {
    if (!confirm('Reset NovaTech workspace to initial clean demo state?')) return;

    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch('/api/system/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetMessage('Demo workspace reset to initial state with 2 meetings, 6 decisions, 8 tasks, and 2 conflicts.');
        await loadStatus();
      }
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          Settings & Environment Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect API integration health, database connectivity, and manage demo workspace state.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gemini Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Key className="w-4 h-4 text-cyan-600" />
              <span>Google Gemini 1.5/2.0 API</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status?.isGeminiActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status?.isGeminiActive ? 'Live Key Active' : 'Demo Mode Active'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {status?.isGeminiActive
              ? 'Real-time Gemini API extraction and semantic conflict detection are operational.'
              : 'Using the high-fidelity built-in Demo Simulation Engine. To run live Gemini 1.5 Flash extraction, set GEMINI_API_KEY in .env.local.'}
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            Variable: GEMINI_API_KEY
          </div>
        </div>

        {/* Supabase Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Database className="w-4 h-4 text-brand-600" />
              <span>Supabase PostgreSQL</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status?.isSupabaseActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-brand-800'
              }`}
            >
              {status?.isSupabaseActive ? 'Cloud DB Connected' : 'In-Memory Store'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {status?.isSupabaseActive
              ? 'Connected to production PostgreSQL database with Row Level Security.'
              : 'Using resilient in-memory server state pre-seeded with the NovaTech Product Team dataset.'}
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
          </div>
        </div>
      </div>

      {/* Workspace Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Fictional Hackathon Workspace
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Team Name</div>
            <div className="text-sm font-bold text-slate-800">NovaTech Product Team</div>
            <div className="text-slate-500">Workspace ID: a0000000-0000-0000-0000-000000000001</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Active Members</div>
            <div className="text-sm font-bold text-slate-800">
              David (PM), Alex (Frontend), Sarah (QA), Emma (Design)
            </div>
            <div className="text-slate-500">4 Accounts Assigned</div>
          </div>
        </div>
      </div>

      {/* Quick Reset Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Demo State Reset</h3>
            <p className="text-xs text-slate-500">
              Restore the pristine demo scenario anytime to replay the hackathon judging demo.
            </p>
          </div>
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
