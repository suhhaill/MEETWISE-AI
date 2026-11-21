// ==============================================================================
// GET /api/meetings/[id] — Retrieve meeting details
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await dbStore.getMeetingById(params.id);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, meeting });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}
