'use client';

// ==============================================================================
// MEETWISE AI — WEEKLY DIGEST & REMINDERS MODAL
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle2, Clock, Mail, User } from 'lucide-react';
import { WorkspaceWeeklyDigest } from '@/lib/services/reminderService';

interface WeeklyDigestModalProps {
  onClose: () => void;
}

export function WeeklyDigestModal({ onClose }: WeeklyDigestModalProps) {
  const [digest, setDigest] = useState<WorkspaceWeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDigest() {
      try {
        const res = await fetch('/api/digest');
        const data = await res.json();
        if (data.success && data.digest) {
          setDigest(data.digest);
        }
      } catch (e) {
        console.error('Failed to load digest:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDigest();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-elevated border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Weekly Team Digest & Deadlines
              </h2>
              <p className="text-xs text-slate-500">
                NovaTech Product Team — Automated Accountability Report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Generating weekly digest...
            </div>
          ) : !digest ? (
            <div className="py-12 text-center text-sm text-red-500">
              Unable to load weekly digest report.
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-medium">Pending Tasks</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {digest.totalPending}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80">
                  <div className="text-xs text-red-700 font-medium">Overdue Items</div>
                  <div className="text-xl font-bold text-red-900 mt-1">
                    {digest.totalOverdue}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200/80">
                  <div className="text-xs text-brand-700 font-medium">Team Members</div>
                  <div className="text-xl font-bold text-brand-900 mt-1">
                    {digest.memberDigests.length}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <div className="text-xs text-emerald-700 font-medium">Audit Status</div>
                  <div className="text-xs font-bold text-emerald-900 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Delivery Transparency Alert */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Notification Infrastructure Note: </span>
                  {digest.deliveryStatus.note}
                </div>
              </div>

              {/* Members Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Breakdown by Team Member
                </h3>

                <div className="space-y-3">
                  {digest.memberDigests.map((md) => (
                    <div
                      key={md.member.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-subtle"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center">
                            {md.member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {md.member.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {md.member.role} • {md.member.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {md.assignedTasks.length} Assigned
                          </span>
                          {md.overdueTasks.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {md.overdueTasks.length} Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tasks List */}
                      {md.assignedTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No tasks assigned.</p>
                      ) : (
                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-100">
                          {md.assignedTasks.map((task) => (
                            <div
                              key={task.id}
                              className="text-xs flex items-center justify-between text-slate-700 py-1"
                            >
                              <div className="flex items-center gap-2">
                                {task.task_status === 'completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span
                                  className={
                                    task.task_status === 'completed'
                                      ? 'line-through text-slate-400'
                                      : 'font-medium'
                                  }
                                >
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
