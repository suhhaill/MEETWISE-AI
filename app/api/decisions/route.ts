// ==============================================================================
// GET /api/decisions — Decision DNA (Query, Filter & Lineage)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspace_id') || 'a0000000-0000-0000-0000-000000000001';
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const speaker = searchParams.get('speaker');

    let decisions = await dbStore.getDecisions(workspaceId);

    if (status) {
      decisions = decisions.filter((d) => d.decision_status === status);
    }

    if (speaker) {
      decisions = decisions.filter((d) => d.source_speaker.toLowerCase() === speaker.toLowerCase());
    }

    if (search) {
      decisions = decisions.filter(
        (d) =>
          d.description.toLowerCase().includes(search) ||
          d.evidence_quote.toLowerCase().includes(search) ||
          d.source_speaker.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      decisions,
      stats: {
        total: decisions.length,
        active: decisions.filter((d) => d.decision_status === 'active').length,
        superseded: decisions.filter((d) => d.decision_status === 'superseded').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve decisions' },
      { status: 500 }
    );
  }
}
