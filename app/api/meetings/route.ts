// ==============================================================================
// GET /api/meetings — List all meetings in the workspace
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspace_id') || 'a0000000-0000-0000-0000-000000000001';

    const meetings = await dbStore.getMeetings(workspaceId);
    return NextResponse.json({ success: true, meetings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve meetings' },
      { status: 500 }
    );
  }
}
