// ==============================================================================
// POST /api/memory/query — Ask Meeting Memory conversational RAG query
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { meetingMemorySearchService } from '@/lib/services/meetingMemorySearchService';
import { MemoryQueryRequestSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = MemoryQueryRequestSchema.parse(body);

    const result = await meetingMemorySearchService.queryMemory(
      validated.query,
      validated.workspace_id
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Memory search error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query workspace memory' },
      { status: 400 }
    );
  }
}
