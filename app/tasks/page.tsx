'use client';

// ==============================================================================
// MEETWISE AI — PROOF BEFORE ACTION (TASK VERIFICATION & COMMITMENT BOARD)
// Evidence-backed task extraction with human approval gate and execution tracking
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  User,
  Clock,
  Sparkles,
  Filter,
  Check,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending_approval' | 'active_board'>('pending_approval');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<string>('all');

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleApproval(taskId: string, action: 'approved' | 'rejected') {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewer: 'David (Lead PM)',
          comments: action === 'approved' ? 'Verified with transcript evidence' : 'Rejected by reviewer',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Approval action failed');
      }

      if (action === 'approved') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      await loadTasks();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditAssignee(task.assignee_name || '');
    setEditDueDate(task.due_date || '');
  }

  async function handleSaveEditedTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modified',
          reviewer: 'David (Lead PM)',
          comments: 'Task fields updated during human verification',
          modified_fields: {
            title: editTitle,
            description: editDesc,
            assignee_name: editAssignee || null,
            due_date: editDueDate || null,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update and approve task');
      }

      setEditingTask(null);
      await loadTasks();
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, task_status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  }

  const pendingApprovals = tasks.filter((t) => t.approval_status === 'pending');
  const approvedTasks = tasks.filter((t) => t.approval_status === 'approved');

  const filteredApprovedTasks = approvedTasks.filter((t) => {
    if (selectedOwner !== 'all') {
      return t.assignee_name?.toLowerCase() === selectedOwner.toLowerCase();
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Signature Feature 3
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Proof Before Action — Tasks & Commitments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every task is extracted with verbatim evidence and calibrated confidence. Requires human approval before entering active execution.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
          <button
            onClick={() => setActiveTab('pending_approval')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending_approval'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Verification Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-600 text-white text-[10px]">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active_board')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active_board'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Approved Commitments</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {approvedTasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING APPROVALS QUEUE */}
      {activeTab === 'pending_approval' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Human Verification Gate: </span>
              MEETWISE AI will never automatically commit team members to tasks without explicit review. Review the supporting evidence quote and confidence score before approving.
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading pending verification queue...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Verification Queue is Clear!</h3>
              <p className="text-xs text-slate-500">
                All extracted action items have been reviewed. Process a new meeting transcript to extract fresh proposals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApprovals.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-subtle hover:border-slate-300 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold">
                        {task.assignee_name ? `Owner: ${task.assignee_name}` : 'Unassigned Owner'}
                      </span>
                      <span className="font-mono text-slate-500">
                        {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Verbatim Supporting Evidence */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Verbatim Transcript Evidence:
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 italic">
                        "{task.evidence_quote}"
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>AI Extraction Confidence</span>
                        <span className="font-bold text-slate-700">
                          {(task.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full"
                          style={{ width: `${task.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApproval(task.id, 'rejected')}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproval(task.id, 'approved')}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE APPROVED COMMITMENTS BOARD */}
      {activeTab === 'active_board' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter by Team Member
            </span>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">All Members ({approvedTasks.length})</option>
              <option value="Alex">Alex (Frontend Developer)</option>
              <option value="Sarah">Sarah (QA Engineer)</option>
              <option value="David">David (Product Manager)</option>
              <option value="Emma">Emma (Designer)</option>
            </select>
          </div>

          {/* Kanban / List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Pending */}
            <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pending Execution
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {filteredApprovedTasks.filter((t) => t.task_status === 'pending').length}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredApprovedTasks
                  .filter((t) => t.task_status === 'pending')
                  .map((task) => (
                    <TaskExecutionCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                  In Progress
                </span>
                <span className="text-xs font-bold text-brand-700">
                  {filteredApprovedTasks.filter((t) => t.task_status === 'in_progress').length}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredApprovedTasks
                  .filter((t) => t.task_status === 'in_progress')
                  .map((task) => (
                    <TaskExecutionCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Completed
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {filteredApprovedTasks.filter((t) => t.task_status === 'completed').length}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredApprovedTasks
                  .filter((t) => t.task_status === 'completed')
                  .map((task) => (
                    <TaskExecutionCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEditedTask}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Task Before Approval
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Assignee</label>
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="">Unassigned</option>
                    <option value="Alex">Alex</option>
                    <option value="Sarah">Sarah</option>
                    <option value="David">David</option>
                    <option value="Emma">Emma</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Deadline</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
              >
                Save & Approve Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Active Kanban Cards
function TaskExecutionCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-2 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-700">{task.assignee_name || 'Unassigned'}</span>
        <span className="text-slate-400 font-mono">
          {task.due_date ? `Due ${task.due_date}` : 'No date'}
        </span>
      </div>

      <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>

      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
        "{task.evidence_quote}"
      </p>

      {/* Status Progress Button Bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <span className="text-slate-400">Move state:</span>
        <div className="flex items-center gap-1">
          {task.task_status !== 'pending' && (
            <button
              onClick={() => onStatusChange(task.id, 'pending')}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Pending
            </button>
          )}
          {task.task_status !== 'in_progress' && (
            <button
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-brand-800 font-semibold"
            >
              In Progress
            </button>
          )}
          {task.task_status !== 'completed' && (
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
            >
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
