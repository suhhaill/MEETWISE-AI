'use client';

// ==============================================================================
// MEETWISE AI — UPLOAD & PROCESSING STUDIO
// Paste, TXT, PDF, and Audio Ingestion with Live Multi-Stage Stepper
// ==============================================================================

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Mic,
  FileCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Info,
  Radio,
  CheckSquare,
} from 'lucide-react';
import { SAMPLE_TRANSCRIPTS } from '@/lib/database/demoData';

type InputMode = 'paste' | 'file' | 'audio';

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [transcript, setTranscript] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processResult, setProcessResult] = useState<any | null>(null);

  // Pre-fill demo if requested via query parameter
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'wednesday') {
      loadWednesdayDemo();
    }
  }, [searchParams]);

  function loadWednesdayDemo() {
    setInputMode('paste');
    setTitle(SAMPLE_TRANSCRIPTS.wednesday_launch_conflict.title);
    setMeetingDate(SAMPLE_TRANSCRIPTS.wednesday_launch_conflict.meeting_date);
    setTranscript(SAMPLE_TRANSCRIPTS.wednesday_launch_conflict.transcript);
    setSelectedFile(null);
    setErrorMessage(null);
    setProcessResult(null);
  }

  function loadSprint43Demo() {
    setInputMode('paste');
    setTitle(SAMPLE_TRANSCRIPTS.sprint_43_planning.title);
    setMeetingDate(SAMPLE_TRANSCRIPTS.sprint_43_planning.meeting_date);
    setTranscript(SAMPLE_TRANSCRIPTS.sprint_43_planning.transcript);
    setSelectedFile(null);
    setErrorMessage(null);
    setProcessResult(null);
  }

  async function handleIngestAndProcess(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setProcessResult(null);

    if (!title.trim()) {
      setErrorMessage('Please enter a meeting title.');
      return;
    }

    if (inputMode === 'paste' && (!transcript || transcript.trim().length < 15)) {
      setErrorMessage('Please paste at least 15 characters of transcript text.');
      return;
    }

    if (inputMode !== 'paste' && !selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1); // Ingestion & sanitization

    try {
      let ingestResponse: any;

      if (inputMode === 'paste') {
        const res = await fetch('/api/meetings/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            meeting_date: meetingDate,
            source_type: 'paste',
            transcript,
          }),
        });
        ingestResponse = await res.json();
      } else {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('meeting_date', meetingDate);
        formData.append('file', selectedFile!);

        const res = await fetch('/api/meetings/ingest', {
          method: 'POST',
          body: formData,
        });
        ingestResponse = await res.json();
      }

      if (!ingestResponse.success || !ingestResponse.meeting) {
        throw new Error(ingestResponse.error || 'Failed to ingest meeting transcript.');
      }

      const meetingId = ingestResponse.meeting.id;

      // Pipeline Step 2: Gemini Intelligence Extraction
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 600));

      // Pipeline Step 3: Conflict Radar & Decision DNA
      setCurrentStep(3);
      const processRes = await fetch(`/api/meetings/${meetingId}/process`, {
        method: 'POST',
      });
      const processData = await processRes.json();

      if (!processData.success) {
        throw new Error(processData.error || 'Pipeline processing failed.');
      }

      // Pipeline Step 4: Verification & Task Preparation
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 500));

      setCurrentStep(5); // Completed
      setProcessResult({
        meetingId,
        ...processData,
      });
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-brand-600" />
            Meeting Ingestion & Intelligence Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload audio, PDF, TXT or paste transcript to run Decision DNA, Conflict Radar and Proof Before Action.
          </p>
        </div>

        {/* Demo Fast-Load Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadWednesdayDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-colors shadow-sm"
            title="Pre-fills the transcript that triggers the December 10 vs December 15 Conflict Radar alert"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
            <span>Load WOW Demo (Dec 10 vs 15)</span>
          </button>
          <button
            type="button"
            onClick={loadSprint43Demo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <span>Load Sprint 43</span>
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleIngestAndProcess}
        className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-6"
      >
        {/* Row 1: Title & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wednesday Mid-Sprint Launch Status Check"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Meeting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Ingestion Mode Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Input Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                inputMode === 'paste'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-800 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                inputMode === 'file'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-800 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>TXT / PDF Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('audio')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                inputMode === 'audio'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-800 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Audio Upload</span>
            </button>
          </div>
        </div>

        {/* Input Controls based on Mode */}
        {inputMode === 'paste' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Transcript Text
            </label>
            <textarea
              rows={8}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="David: Good morning everyone...&#10;Sarah: I will complete test coverage by December 2..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Format speaker turns as "Speaker: statement" for optimal attribution.
            </p>
          </div>
        )}

        {inputMode === 'file' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Document File (TXT or PDF)
            </label>
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <input
                  type="file"
                  accept=".txt,.pdf,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Supports TXT, Markdown, and text-embedded PDFs up to 10MB.
              </p>
            </div>
          </div>
        )}

        {inputMode === 'audio' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Audio Recording
            </label>
            <div className="p-8 border-2 border-dashed border-cyan-300 bg-cyan-50/20 rounded-2xl text-center space-y-3">
              <Mic className="w-8 h-8 text-cyan-600 mx-auto" />
              <div>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-100 file:text-cyan-800 hover:file:bg-cyan-200 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Transcribed via Gemini Multimodal Audio API. Supported formats: MP3, WAV, M4A, WEBM (Max 25MB).
              </p>
            </div>
          </div>
        )}

        {/* Validation / Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Validation Error: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Processing Stepper */}
        {isProcessing && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                AI Meeting Intelligence Pipeline Executing...
              </span>
              <span className="text-cyan-400 font-mono">Step {currentStep} of 4</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div
                className={`h-1.5 rounded-full ${
                  currentStep >= 1 ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
              <div
                className={`h-1.5 rounded-full ${
                  currentStep >= 2 ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
              <div
                className={`h-1.5 rounded-full ${
                  currentStep >= 3 ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
              <div
                className={`h-1.5 rounded-full ${
                  currentStep >= 4 ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            </div>

            <p className="text-[11px] text-slate-300">
              {currentStep === 1 && 'Ingesting & sanitizing transcript...'}
              {currentStep === 2 && 'Gemini model extracting summary, decisions, and action items...'}
              {currentStep === 3 && 'Conflict Radar comparing against historical Decision DNA...'}
              {currentStep === 4 && 'Generating verifiable task proposals for human review...'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run MEETWISE AI Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* PIPELINE OUTPUT RESULTS CARD */}
      {processResult && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-emerald-200 shadow-card space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Processing Complete — Meeting Intelligence Extracted
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Engine: {processResult.model_used}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/meetings')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View in Meetings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meeting Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Meeting Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {processResult.data.summary}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {processResult.data.key_topics?.map((topic: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                >
                  #{topic}
                </span>
              ))}
            </div>
          </div>

          {/* Conflict Radar Flag (The WOW Moment Alert!) */}
          {processResult.data.conflicts && processResult.data.conflicts.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-extrabold text-amber-900">
                    Conflict Radar Alert Detected!
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                  {processResult.data.conflicts.length} Potential Revision
                </span>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {processResult.data.conflicts[0].explanation}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-amber-800 italic">
                  Note: Historical decision remains active until you confirm this revision.
                </span>
                <button
                  onClick={() => router.push('/conflicts')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Inspect in Conflict Radar →
                </button>
              </div>
            </div>
          )}

          {/* Proof Before Action: Proposed Tasks */}
          {processResult.data.proposed_tasks && processResult.data.proposed_tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                  Proof Before Action — {processResult.data.proposed_tasks.length} Proposed Tasks
                </h3>
                <button
                  onClick={() => router.push('/tasks')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  Go to Verification Board →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {processResult.data.proposed_tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                        {task.assignee_name || 'Unassigned'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{task.title}</div>
                    <div className="text-[11px] text-slate-500 italic">
                      "{task.evidence_quote}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-slate-400">
          Loading Ingestion Studio...
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  );
}
