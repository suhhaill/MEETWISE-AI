// ==============================================================================
// GET /api/system/status — Check active environment & configuration
// ==============================================================================

import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET() {
  try {
    const status = dbStore.getSystemStatus();
    const metrics = await dbStore.getDashboardMetrics(status.workspaceId);

    return NextResponse.json({
      success: true,
      status,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get system status' },
      { status: 500 }
    );
  }
}
