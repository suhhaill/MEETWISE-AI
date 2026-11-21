// ==============================================================================
// POST /api/system/reset — Reset workspace to pristine demo state
// ==============================================================================

import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function POST() {
  try {
    dbStore.resetDemo();
    return NextResponse.json({
      success: true,
      message: 'Demo workspace reset to initial state successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reset demo state' },
      { status: 500 }
    );
  }
}
