'use client';

// ==============================================================================
// MEETWISE AI — MEETINGS REGISTRY & TRANSCRIPT ARCHIVE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  User,
} from 'lucide-react';
import { Meeting } from '@/types';
import { transcriptService, ParsedDialogueLine } from '@/lib/services/transcriptService';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const res = await fetch('/api/meetings');
        const data = await res.json();
        if (data.success && data.meetings) {
          setMeetings(data.meetings);
          if (data.meetings.length > 0) {
            setSelectedMeeting(data.meetings[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load meetings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMeetings();
  }, []);

  const parsedDialogue: ParsedDialogueLine[] = selectedMeeting
    ? transcriptService.parseDialogueLines(selectedMeeting.transcript)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            Meeting Transcripts & Memory Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical meeting repository for NovaTech Product Team. All intelligence, decisions, and tasks trace back to these records.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Meeting</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No meetings found.</h3>
          <p className="text-xs text-slate-500">
            Ingest your first meeting transcript to begin building Decision DNA.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Meeting List */}
          <div className="space-y-3 lg:col-span-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Recorded Sessions ({meetings.length})
            </h2>

            <div className="space-y-2">
              {meetings.map((m) => {
                const isSelected = selectedMeeting?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMeeting(m)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-white shadow-card ring-1 ring-brand-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-brand-700 uppercase">
                        {m.source_type}
                      </span>
                      <span className="text-slate-400">{m.meeting_date}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {m.title}
                    </div>

                    {m.summary && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {m.summary}
                      </p>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {m.processing_status}
                      </span>
                      <span className="text-slate-400 flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Meeting Transcript & Details Viewer */}
          <div className="lg:col-span-2 space-y-4">
            {selectedMeeting ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-5">
                {/* Meeting Header */}
                <div className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Session Date: {selectedMeeting.meeting_date}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {selectedMeeting.id.slice(0, 8)}...
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedMeeting.title}
                  </h2>
                </div>

                {/* AI Summary & Topics */}
                {selectedMeeting.summary && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Meeting Summary
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {selectedMeeting.summary}
                    </p>
                    {selectedMeeting.key_topics && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedMeeting.key_topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dialogue Transcript Stream */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verbatim Conversation Transcript ({parsedDialogue.length} Turns)
                  </h3>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 max-h-[500px] overflow-y-auto">
                    {parsedDialogue.map((turn, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white border border-slate-100 shadow-subtle space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                            {turn.speaker}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Turn #{i + 1}</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed pl-3.5 border-l-2 border-slate-100">
                          {turn.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-slate-400">
                Select a meeting to view its transcript.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
