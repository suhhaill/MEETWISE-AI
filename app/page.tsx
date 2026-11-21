'use client';

// ==============================================================================
// MEETWISE AI — DASHBOARD OVERVIEW
// Team Meteor — Product Space AI Agentic Hackathon
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dna,
  Radio,
  CheckSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Decision, Conflict, Task, DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statusRes, conflictsRes, decisionsRes, tasksRes] = await Promise.all([
          fetch('/api/system/status'),
          fetch('/api/conflicts?status=unreviewed'),
          fetch('/api/decisions'),
          fetch('/api/tasks?approval_status=pending'),
        ]);

        const [statusData, conflictsData, decisionsData, tasksData] = await Promise.all([
          statusRes.json(),
          conflictsRes.json(),
          decisionsRes.json(),
          tasksRes.json(),
        ]);

        if (statusData.success && statusData.metrics) {
          setMetrics(statusData.metrics);
        }
        if (conflictsData.success) {
          setConflicts(conflictsData.conflicts.slice(0, 2));
        }
        if (decisionsData.success) {
          setDecisions(decisionsData.decisions.slice(0, 4));
        }
        if (tasksData.success) {
          setPendingTasks(tasksData.tasks.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 shadow-card border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Product Space AI Agentic Hackathon — Team Meteor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            From Conversations to Completed Actions.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            MEETWISE AI captures meeting conversations, remembers agreements across meetings
            through <strong className="text-white">Decision DNA</strong>, flags contradictions with{' '}
            <strong className="text-white">Conflict Radar</strong>, and enforces{' '}
            <strong className="text-white">Proof Before Action</strong> with human-in-the-loop
            verification.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/upload?demo=wednesday"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Test WOW Demo Flow (Dec 10 vs Dec 15 Conflict)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-colors"
            >
              <span>Upload Custom Transcript</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Decisions */}
        <Link
          href="/decisions"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Decision DNA
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dna className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '...' : metrics?.activeDecisions ?? 6}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">Active & Confirmed</span>
            <span>• {metrics?.supersededDecisions ?? 0} Superseded</span>
          </div>
        </Link>

        {/* Metric 2: Conflicts */}
        <Link
          href="/conflicts"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-amber-300 hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conflict Radar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <span>{loading ? '...' : metrics?.activeConflicts ?? 2}</span>
            {(metrics?.activeConflicts ?? 2) > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                Needs Review
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-amber-600 font-semibold">Unresolved Revisions</span>
          </div>
        </Link>

        {/* Metric 3: Proof Before Action */}
        <Link
          href="/tasks"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '...' : metrics?.pendingApprovals ?? 3}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-brand-600 font-semibold">Proof Before Action</span>
            <span>• Human Gate Active</span>
          </div>
        </Link>

        {/* Metric 4: Meetings */}
        <Link
          href="/meetings"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Meeting Records
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '...' : metrics?.totalMeetings ?? 2}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            NovaTech Product Team Workspace
          </div>
        </Link>
      </div>

      {/* TWO-COLUMN GRID: CONFLICT RADAR ALERT & DECISION STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: CONFLICT RADAR SPOTLIGHT */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Conflict Radar Alerts</h2>
                <p className="text-xs text-slate-400">
                  Potential contradictions and revisions requiring human confirmation
                </p>
              </div>
            </div>
            <Link
              href="/conflicts"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : conflicts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>All historical decisions are aligned. No active conflicts!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {conflict.conflict_type} • {conflict.severity} severity
                    </span>
                    <span className="text-[11px] text-slate-400">Unreviewed</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {conflict.explanation}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Historical: {conflict.old_decision?.description.slice(0, 35)}...
                    </span>
                    <Link
                      href="/conflicts"
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Review & Confirm
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DECISION DNA STREAM */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Decision DNA Memory</h2>
                <p className="text-xs text-slate-400">
                  Verifiable agreements connected across meeting history
                </p>
              </div>
            </div>
            <Link
              href="/decisions"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Explore DNA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading decisions...</div>
          ) : decisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No decisions recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dec.decision_status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dec.decision_status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {dec.meeting_date || 'Past Meeting'} • {dec.source_speaker}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {dec.description}
                  </p>

                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                    "{dec.evidence_quote}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PROOF BEFORE ACTION: PENDING HUMAN APPROVALS QUEUE */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Proof Before Action — Verification Queue
              </h2>
              <p className="text-xs text-slate-400">
                Action items extracted by AI awaiting human approval before commitment
              </p>
            </div>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Open Task Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
        ) : pendingTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No pending tasks waiting for approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-subtle hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {task.assignee_name || 'Unassigned'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{task.evidence_quote}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Confidence: {(task.confidence * 100).toFixed(0)}%
                  </span>
                  <Link
                    href="/tasks"
                    className="text-xs font-bold text-brand-600 hover:text-brand-800"
                  >
                    Verify & Approve →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
