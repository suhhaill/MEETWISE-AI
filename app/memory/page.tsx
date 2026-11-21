'use client';

// ==============================================================================
// MEETWISE AI — ASK MEETING MEMORY (WORKSPACE RAG CHAT)
// Evidence-grounded conversational assistant querying meetings, decisions, and tasks
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Dna,
  CheckSquare,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { MemoryQueryResult, MemoryAnswerCitation } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  result?: MemoryQueryResult;
  timestamp: string;
}

export default function AskMemoryPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your workspace memory assistant for the NovaTech Product Team. I can retrieve any confirmed decision, task commitment, or discussion from your past meetings with exact verbatim quotes.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'What launch date was originally confirmed?',
    'Did anyone propose changing the launch date?',
    'Who proposed the change and why?',
    'Has the new launch date been officially approved?',
    'Who owns frontend development?',
    'Which tasks are overdue?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendQuery(queryToSend?: string) {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/memory/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'Failed to query memory.');
      }

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: data.result.answer,
        result: data.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Error querying workspace memory: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          Factual Workspace RAG
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Ask Meeting Memory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ground-truth conversational retrieval over NovaTech team meetings. Every response cites exact dates, speakers, and transcript evidence quotes.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Judge Inquiries:
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(q)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 text-xs text-slate-700 font-medium transition-all shadow-subtle hover:scale-[1.01]"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col h-[560px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white font-bold text-xs'
                    : 'bg-brand-900 text-cyan-400 font-bold text-xs shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm space-y-3 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none shadow-subtle'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Evidence Citations Panel */}
                {msg.result && msg.result.citations && msg.result.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Grounded Evidence Citations ({msg.result.citations.length})
                    </div>

                    <div className="space-y-2">
                      {msg.result.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs shadow-subtle"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                  cit.source_type === 'proposal'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : cit.source_type === 'decision'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : cit.source_type === 'conflict'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : cit.source_type === 'task'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {cit.source_type}
                              </span>
                              <span>
                                {cit.meeting_title} ({cit.meeting_date})
                              </span>
                            </span>
                            <span className="text-brand-700 font-bold">Speaker: {cit.speaker}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 italic border-l-2 border-slate-200 pl-2">
                            "{cit.evidence_quote}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.sender === 'user' ? 'text-brand-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-900 text-cyan-400 flex items-center justify-center text-xs animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <span>Searching Decision DNA and meeting transcripts...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about meetings, dates, owners, or decisions..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
