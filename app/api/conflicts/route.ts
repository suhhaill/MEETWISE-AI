// ==============================================================================
// GET /api/conflicts — Conflict Radar records retrieval & filtering
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspace_id') || 'a0000000-0000-0000-0000-000000000001';
    const status = searchParams.get('status');

    let conflicts = await dbStore.getConflicts(workspaceId);

    if (status) {
      conflicts = conflicts.filter((c) => c.review_status === status);
    }

    return NextResponse.json({
      success: true,
      conflicts,
      unreviewedCount: conflicts.filter((c) => c.review_status === 'unreviewed').length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve conflicts' },
      { status: 500 }
    );
  }
}
