// ==============================================================================
// GET /api/digest — Weekly team digest & upcoming deadlines
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/lib/services/reminderService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspace_id') || 'a0000000-0000-0000-0000-000000000001';

    const digest = await reminderService.generateWeeklyDigest(workspaceId);
    return NextResponse.json({ success: true, digest });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate weekly digest' },
      { status: 500 }
    );
  }
}
