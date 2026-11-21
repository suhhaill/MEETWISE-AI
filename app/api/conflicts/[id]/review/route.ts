// ==============================================================================
// POST /api/conflicts/[id]/review — Human-in-the-loop Conflict Confirmation
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { conflictDetectionService } from '@/lib/services/conflictDetectionService';
import { ConflictReviewActionSchema } from '@/lib/validation/schemas';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conflictId = params.id;
    const body = await req.json();

    const validated = ConflictReviewActionSchema.parse(body);

    const result = await conflictDetectionService.applyReviewAction(
      conflictId,
      validated.action,
      validated.reviewer_notes
    );

    return NextResponse.json({
      success: true,
      message: `Conflict review applied (${validated.action}).`,
      conflict: result.conflict,
    });
  } catch (err: any) {
    console.error('Conflict review error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to review conflict' },
      { status: 400 }
    );
  }
}
