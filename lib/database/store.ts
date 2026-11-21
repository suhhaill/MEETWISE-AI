// ==============================================================================
// MEETWISE AI — UNIFIED DATA STORE & PERSISTENCE LAYER
// Dual-Mode: Supabase PostgreSQL (Production) + In-Memory Store (Demo Fallback)
// ==============================================================================

import {
  Workspace,
  Member,
  Meeting,
  Decision,
  Task,
  Conflict,
  Approval,
  Reminder,
  DashboardMetrics,
} from '@/types';
import {
  DEMO_WORKSPACE_ID,
  INITIAL_WORKSPACE,
  INITIAL_MEMBERS,
  INITIAL_MEETINGS,
  INITIAL_DECISIONS,
  INITIAL_TASKS,
  INITIAL_CONFLICTS,
  INITIAL_APPROVALS,
  INITIAL_REMINDERS,
} from './demoData';
import { isSupabaseConfigured, getSupabaseClient } from './supabaseClient';

// Server-side in-memory state container for zero-config demo mode
class MemoryDataStore {
  workspace: Workspace = JSON.parse(JSON.stringify(INITIAL_WORKSPACE));
  members: Member[] = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
  meetings: Meeting[] = JSON.parse(JSON.stringify(INITIAL_MEETINGS));
  decisions: Decision[] = JSON.parse(JSON.stringify(INITIAL_DECISIONS));
  tasks: Task[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
  conflicts: Conflict[] = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
  approvals: Approval[] = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
  reminders: Reminder[] = JSON.parse(JSON.stringify(INITIAL_REMINDERS));

  reset() {
    this.workspace = JSON.parse(JSON.stringify(INITIAL_WORKSPACE));
    this.members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    this.meetings = JSON.parse(JSON.stringify(INITIAL_MEETINGS));
    this.decisions = JSON.parse(JSON.stringify(INITIAL_DECISIONS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.conflicts = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
    this.approvals = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
    this.reminders = JSON.parse(JSON.stringify(INITIAL_REMINDERS));
  }
}

// Global singleton across serverless invocations in dev
const globalStore = (globalThis as any).__meetwise_store__ || new MemoryDataStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__meetwise_store__ = globalStore;
}

export const dbStore = {
  // System status check
  getSystemStatus() {
    const hasGemini = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'
    );
    return {
      isSupabaseActive: isSupabaseConfigured,
      isGeminiActive: hasGemini,
      mode: isSupabaseConfigured && hasGemini ? ('live' as const) : ('demo' as const),
      workspaceId: DEMO_WORKSPACE_ID,
    };
  },

  // Workspace
  async getWorkspace(id: string = DEMO_WORKSPACE_ID): Promise<Workspace> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    return globalStore.workspace;
  },

  // Members
  async getMembers(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Member[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('workspace_id', workspaceId);
      if (!error && data && data.length > 0) return data;
    }
    return globalStore.members.filter((m: Member) => m.workspace_id === workspaceId);
  },

  // Meetings
  async getMeetings(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Meeting[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('meeting_date', { ascending: false });
      if (!error && data) return data;
    }
    return [...globalStore.meetings]
      .filter((m: Meeting) => m.workspace_id === workspaceId)
      .sort(
        (a, b) =>
          new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
      );
  },

  async getMeetingById(id: string): Promise<Meeting | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    return globalStore.meetings.find((m: Meeting) => m.id === id) || null;
  },

  async createMeeting(meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Promise<Meeting> {
    const newMeeting: Meeting = {
      ...meetingData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .insert(newMeeting)
        .select()
        .single();
      if (!error && data) return data;
    }

    globalStore.meetings.unshift(newMeeting);
    return newMeeting;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = globalStore.meetings.findIndex((m: Meeting) => m.id === id);
    if (index !== -1) {
      globalStore.meetings[index] = {
        ...globalStore.meetings[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return globalStore.meetings[index];
    }
    return null;
  },

  // Decisions
  async getDecisions(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Decision[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('decisions')
        .select('*, meetings(title, meeting_date)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          ...d,
          meeting_title: d.meetings?.title,
          meeting_date: d.meetings?.meeting_date,
        }));
      }
    }

    return [...globalStore.decisions]
      .filter((d: Decision) => d.workspace_id === workspaceId)
      .map((d: Decision) => {
        const meeting = globalStore.meetings.find((m: Meeting) => m.id === d.meeting_id);
        return {
          ...d,
          meeting_title: meeting?.title || d.meeting_title,
          meeting_date: meeting?.meeting_date || d.meeting_date,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createDecisions(decisions: Array<Omit<Decision, 'id' | 'created_at' | 'updated_at'>>): Promise<Decision[]> {
    const newDecisions: Decision[] = decisions.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('decisions')
        .insert(newDecisions)
        .select();
      if (!error && data) return data;
    }

    globalStore.decisions.unshift(...newDecisions);
    return newDecisions;
  },

  async supersedeDecision(oldDecisionId: string, newDecisionId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from('decisions')
        .update({ decision_status: 'superseded', updated_at: new Date().toISOString() })
        .eq('id', oldDecisionId);

      await supabase
        .from('decisions')
        .update({ supersedes_decision_id: oldDecisionId, updated_at: new Date().toISOString() })
        .eq('id', newDecisionId);
      return true;
    }

    const oldIndex = globalStore.decisions.findIndex((d: Decision) => d.id === oldDecisionId);
    if (oldIndex !== -1) {
      globalStore.decisions[oldIndex].decision_status = 'superseded';
      globalStore.decisions[oldIndex].updated_at = new Date().toISOString();
    }

    const newIndex = globalStore.decisions.findIndex((d: Decision) => d.id === newDecisionId);
    if (newIndex !== -1) {
      globalStore.decisions[newIndex].supersedes_decision_id = oldDecisionId;
      globalStore.decisions[newIndex].updated_at = new Date().toISOString();
    }

    return true;
  },

  // Tasks
  async getTasks(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Task[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, meetings(title, meeting_date)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((t: any) => ({
          ...t,
          meeting_title: t.meetings?.title,
          meeting_date: t.meetings?.meeting_date,
        }));
      }
    }

    return [...globalStore.tasks]
      .filter((t: Task) => t.workspace_id === workspaceId)
      .map((t: Task) => {
        const meeting = globalStore.meetings.find((m: Meeting) => m.id === t.meeting_id);
        return {
          ...t,
          meeting_title: meeting?.title || t.meeting_title,
          meeting_date: meeting?.meeting_date || t.meeting_date,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createTasks(tasks: Array<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task[]> {
    const newTasks: Task[] = tasks.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTasks)
        .select();
      if (!error && data) return data;
    }

    globalStore.tasks.unshift(...newTasks);
    return newTasks;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = globalStore.tasks.findIndex((t: Task) => t.id === id);
    if (index !== -1) {
      globalStore.tasks[index] = {
        ...globalStore.tasks[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return globalStore.tasks[index];
    }
    return null;
  },

  // Approvals
  async recordApproval(approvalData: Omit<Approval, 'id' | 'reviewed_at'>): Promise<Approval> {
    const newApproval: Approval = {
      ...approvalData,
      id: crypto.randomUUID(),
      reviewed_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('approvals')
        .insert(newApproval)
        .select()
        .single();
      if (!error && data) return data;
    }

    globalStore.approvals.unshift(newApproval);
    return newApproval;
  },

  // Conflicts
  async getConflicts(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Conflict[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('conflicts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }

    return [...globalStore.conflicts]
      .filter((c: Conflict) => c.workspace_id === workspaceId)
      .map((c: Conflict) => {
        const oldDec = globalStore.decisions.find((d: Decision) => d.id === c.old_decision_id);
        const newDec = c.new_decision_id
          ? globalStore.decisions.find((d: Decision) => d.id === c.new_decision_id)
          : undefined;
        return {
          ...c,
          old_decision: oldDec || c.old_decision,
          new_decision: newDec || c.new_decision,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createConflict(conflictData: Omit<Conflict, 'id' | 'created_at'>): Promise<Conflict> {
    const newConflict: Conflict = {
      ...conflictData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('conflicts')
        .insert(newConflict)
        .select()
        .single();
      if (!error && data) return data;
    }

    globalStore.conflicts.unshift(newConflict);
    return newConflict;
  },

  async reviewConflict(
    id: string,
    action: 'confirm_change' | 'dismiss' | 'resolve',
    reviewerNotes?: string | null
  ): Promise<Conflict | null> {
    const statusMap = {
      confirm_change: 'confirmed_change' as const,
      dismiss: 'dismissed' as const,
      resolve: 'resolved' as const,
    };
    const newStatus = statusMap[action];

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('conflicts')
        .update({
          review_status: newStatus,
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = globalStore.conflicts.findIndex((c: Conflict) => c.id === id);
    if (index !== -1) {
      globalStore.conflicts[index] = {
        ...globalStore.conflicts[index],
        review_status: newStatus,
        reviewer_notes: reviewerNotes || null,
        reviewed_at: new Date().toISOString(),
      };
      return globalStore.conflicts[index];
    }
    return null;
  },

  // Reminders
  async getReminders(workspaceId: string = DEMO_WORKSPACE_ID): Promise<Reminder[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .eq('workspace_id', workspaceId)
        .order('scheduled_at', { ascending: true });
      if (!error && data) return data;
    }

    return globalStore.reminders
      .filter((r: Reminder) => r.workspace_id === workspaceId)
      .map((r: Reminder) => ({
        ...r,
        task: globalStore.tasks.find((t: Task) => t.id === r.task_id),
      }));
  },

  // Dashboard Metrics Aggregator
  async getDashboardMetrics(workspaceId: string = DEMO_WORKSPACE_ID): Promise<DashboardMetrics> {
    const [meetings, decisions, tasks, conflicts, members] = await Promise.all([
      this.getMeetings(workspaceId),
      this.getDecisions(workspaceId),
      this.getTasks(workspaceId),
      this.getConflicts(workspaceId),
      this.getMembers(workspaceId),
    ]);

    const activeDecisions = decisions.filter((d) => d.decision_status === 'active').length;
    const supersededDecisions = decisions.filter((d) => d.decision_status === 'superseded').length;
    const pendingApprovals = tasks.filter((t) => t.approval_status === 'pending').length;
    const approvedTasks = tasks.filter((t) => t.approval_status === 'approved').length;
    const completedTasks = tasks.filter((t) => t.task_status === 'completed').length;
    const activeConflicts = conflicts.filter((c) => c.review_status === 'unreviewed').length;
    const resolvedConflicts = conflicts.filter((c) => c.review_status !== 'unreviewed').length;

    return {
      totalMeetings: meetings.length,
      activeDecisions,
      supersededDecisions,
      pendingApprovals,
      approvedTasks,
      completedTasks,
      activeConflicts,
      resolvedConflicts,
      teamMembersCount: members.length,
    };
  },

  resetDemo() {
    globalStore.reset();
    return true;
  },
};
