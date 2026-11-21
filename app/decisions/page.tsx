'use client';

// ==============================================================================
// MEETWISE AI — DECISION DNA (PERSISTENT ORGANIZATIONAL MEMORY)
// Searchable, filterable historical memory preserving lineage and active/superseded states
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Dna,
  Search,
  Filter,
  Calendar,
  User,
  History,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  GitCommit,
  Sparkles,
} from 'lucide-react';
import { Decision } from '@/types';

export default function DecisionDNAPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'superseded'>('all');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [selectedDecisionLineage, setSelectedDecisionLineage] = useState<Decision | null>(null);

  async function loadDecisions() {
    setLoading(true);
    try {
      const res = await fetch('/api/decisions');
      const data = await res.json();
      if (data.success && data.decisions) {
        setDecisions(data.decisions);
      }
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDecisions();
  }, []);

  // Filter logic
  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter !== 'all' && d.decision_status !== statusFilter) return false;
    if (selectedSpeaker !== 'all' && d.source_speaker.toLowerCase() !== selectedSpeaker.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.description.toLowerCase().includes(q) ||
        d.evidence_quote.toLowerCase().includes(q) ||
        d.source_speaker.toLowerCase().includes(q) ||
        (d.meeting_title && d.meeting_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeCount = decisions.filter((d) => d.decision_status === 'active').length;
  const supersededCount = decisions.filter((d) => d.decision_status === 'superseded').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-brand-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Dna className="w-3.5 h-3.5 text-brand-600" />
            Signature Feature 1
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Decision DNA Memory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Persistent organizational memory across meetings. Preserves full history without ever silently overwriting agreements.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-subtle">
            <span className="text-slate-500">Active: </span>
            <span className="font-bold text-emerald-600">{activeCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-subtle">
            <span className="text-slate-500">Superseded: </span>
            <span className="font-bold text-slate-700">{supersededCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decisions, quotes, speakers..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All ({decisions.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('superseded')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'superseded' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              Superseded ({supersededCount})
            </button>
          </div>

          {/* Speaker Selector */}
          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Speakers</option>
            <option value="David">David (PM)</option>
            <option value="Alex">Alex (Frontend)</option>
            <option value="Sarah">Sarah (QA)</option>
            <option value="Emma">Emma (Designer)</option>
          </select>
        </div>
      </div>

      {/* Decisions List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading Decision DNA...</div>
      ) : filteredDecisions.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-bold text-slate-700">No decisions match the selected filters.</p>
          <p className="text-xs text-slate-400">Try clearing your search query or switching tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecisions.map((decision) => {
            const isSuperseded = decision.decision_status === 'superseded';

            return (
              <div
                key={decision.id}
                className={`p-5 rounded-2xl border bg-white shadow-subtle space-y-3 flex flex-col justify-between transition-all hover:shadow-card ${
                  isSuperseded
                    ? 'border-slate-200 bg-slate-50/40 opacity-80'
                    : 'border-slate-200/90 hover:border-brand-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isSuperseded
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {decision.decision_status}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {decision.meeting_date || 'Past'}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold leading-snug ${
                      isSuperseded ? 'text-slate-600 line-through' : 'text-slate-900'
                    }`}
                  >
                    {decision.description}
                  </h3>

                  {/* Verbatim Transcript Quote */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    "{decision.evidence_quote}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">
                      Speaker: {decision.source_speaker}
                    </span>
                    <span>Confidence: {(decision.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Footer Metadata & Lineage Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]" title={decision.meeting_title}>
                    {decision.meeting_title || 'Meeting Record'}
                  </span>

                  <button
                    onClick={() => setSelectedDecisionLineage(decision)}
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 text-[11px]"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>View Lineage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LINEAGE DRAWER / MODAL */}
      {selectedDecisionLineage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Decision Lineage & Audit History
                </h3>
              </div>
              <button
                onClick={() => setSelectedDecisionLineage(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Selected Decision</div>
                <div className="font-bold text-slate-900">{selectedDecisionLineage.description}</div>
                <div className="text-slate-500">
                  Status: <strong className="uppercase">{selectedDecisionLineage.decision_status}</strong>
                </div>
              </div>

              {selectedDecisionLineage.supersedes_decision_id ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Evolutionary Link: </span>
                  This decision superseded an earlier agreement (ID: {selectedDecisionLineage.supersedes_decision_id.slice(0, 8)}...) after human confirmation in Conflict Radar.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <span className="font-bold">Original Agreement: </span>
                  This is a primary decision agreed during Sprint Kickoff.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDecisionLineage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Lineage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
