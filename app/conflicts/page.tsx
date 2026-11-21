'use client';

// ==============================================================================
// MEETWISE AI — CONFLICT RADAR (SIGNATURE WOW FEATURE)
// Contextual AI Comparison between historical agreements and new proposals
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conflict } from '@/types';

export default function ConflictRadarPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'unreviewed' | 'resolved' | 'all'>('unreviewed');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  async function loadConflicts() {
    setLoading(true);
    try {
      const res = await fetch('/api/conflicts');
      const data = await res.json();
      if (data.success && data.conflicts) {
        setConflicts(data.conflicts);
      }
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConflicts();
  }, []);

  async function handleReviewAction(
    conflictId: string,
    action: 'confirm_change' | 'dismiss' | 'resolve'
  ) {
    setIsSubmitting(true);
    setSuccessBanner(null);

    try {
      const res = await fetch(`/api/conflicts/${conflictId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewer_notes: reviewerNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to review conflict.');
      }

      // Celebrate if confirmed change!
      if (action === 'confirm_change') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setSuccessBanner(
          'Decision change confirmed! The historical decision was safely marked as SUPERSEDED and the new agreement is now active in Decision DNA.'
        );
      } else if (action === 'dismiss') {
        setSuccessBanner('Conflict alert dismissed. Historical decision remains active and confirmed.');
      } else {
        setSuccessBanner('Conflict marked as resolved with reviewer documentation.');
      }

      setActiveReviewId(null);
      setReviewerNotes('');
      await loadConflicts();
    } catch (err: any) {
      alert(`Review error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredConflicts = conflicts.filter((c) => {
    if (filterTab === 'unreviewed') return c.review_status === 'unreviewed';
    if (filterTab === 'resolved') return c.review_status !== 'unreviewed';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Signature WOW Feature
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Conflict Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detects semantic contradictions, date shifts, and revisions across meetings. Historical decisions are preserved until confirmed.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setFilterTab('unreviewed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'unreviewed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Review (
            {conflicts.filter((c) => c.review_status === 'unreviewed').length})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'resolved'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved (
            {conflicts.filter((c) => c.review_status !== 'unreviewed').length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({conflicts.length})
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-start justify-between gap-3 shadow-subtle animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Conflicts List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">
          Scanning workspace memory for decision conflicts...
        </div>
      ) : filteredConflicts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {filterTab === 'unreviewed'
              ? 'No Unreviewed Conflicts Found!'
              : 'No conflict records match this tab.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All team agreements are in alignment. To test this feature live, upload the Wednesday Launch Date change demo in the Upload studio.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredConflicts.map((conflict) => {
            const isReviewingThis = activeReviewId === conflict.id;

            return (
              <div
                key={conflict.id}
                className={`p-6 rounded-2xl border bg-white shadow-card space-y-5 transition-all ${
                  conflict.review_status === 'unreviewed'
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Card Top: Badges & Severity */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        conflict.conflict_type === 'contradiction'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : conflict.conflict_type === 'revision'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {conflict.conflict_type}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        conflict.severity === 'high' || conflict.severity === 'critical'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {conflict.severity.toUpperCase()} SEVERITY
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        conflict.review_status === 'unreviewed'
                          ? 'bg-amber-500 text-white animate-pulse'
                          : conflict.review_status === 'confirmed_change'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {conflict.review_status === 'unreviewed'
                        ? 'Requires Human Confirmation'
                        : conflict.review_status === 'confirmed_change'
                        ? 'Confirmed & Superseded'
                        : conflict.review_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* AI Explanation Bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">AI Diagnosis: </span>
                    {conflict.explanation}
                  </div>
                </div>

                {/* Side-by-Side Dual Evidence Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Historical Decision Panel */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">
                        Historical Agreement
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Active Confirmed
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      {conflict.old_decision?.description || 'Historical recorded decision'}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                      "{conflict.old_decision?.evidence_quote}"
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Speaker: {conflict.old_decision?.source_speaker || 'David'}</span>
                      <span>
                        Meeting: {conflict.old_decision?.meeting_title || 'Past Meeting'} (
                        {conflict.old_decision?.meeting_date || 'Past'})
                      </span>
                    </div>
                  </div>

                  {/* Proposed New Statement Panel */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-800 uppercase tracking-wider">
                        Incoming Proposal / Change
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        Pending Confirmation
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      {conflict.proposed_statement?.description ||
                        'Proposed modification from recent meeting'}
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-amber-100 text-[11px] text-amber-900 italic">
                      "{conflict.proposed_statement?.evidence_quote}"
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Speaker: {conflict.proposed_statement?.speaker || 'David'}</span>
                      <span>
                        Meeting: {conflict.proposed_statement?.meeting_title || 'Recent Meeting'} (
                        {conflict.proposed_statement?.meeting_date || 'Recent'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reviewer Notes if already resolved */}
                {conflict.reviewer_notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">Reviewer Notes: </span>
                    {conflict.reviewer_notes}
                  </div>
                )}

                {/* Human Confirmation Actions (Proof Gate) */}
                {conflict.review_status === 'unreviewed' && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    {!isReviewingThis ? (
                      <div className="flex flex-wrap items-center justify-end gap-2.5">
                        <button
                          onClick={() => setActiveReviewId(conflict.id)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Supersede Decision</span>
                        </button>
                        <button
                          onClick={() => handleReviewAction(conflict.id, 'dismiss')}
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Dismiss Alert (Keep Historical)
                        </button>
                        <button
                          onClick={() => handleReviewAction(conflict.id, 'resolve')}
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                        <div className="text-xs font-bold text-slate-800">
                          Human Reviewer Confirmation:
                        </div>
                        <textarea
                          rows={2}
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                          placeholder="Optional reviewer notes (e.g., 'Approved launch date slide to Dec 15 due to partner sandbox delay')..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveReviewId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReviewAction(conflict.id, 'confirm_change')}
                            disabled={isSubmitting}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                            <span>Confirm & Supersede Now</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
