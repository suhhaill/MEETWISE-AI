// ==============================================================================
// POST /api/meetings/ingest — Ingest transcript via text, file, or audio
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';
import { transcriptService } from '@/lib/services/transcriptService';
import { audioTranscriptionService } from '@/lib/services/audioTranscriptionService';
import { MeetingIngestRequestSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let title = '';
    let meetingDate = '';
    let sourceType: 'paste' | 'txt' | 'pdf' | 'audio' = 'paste';
    let transcript = '';
    let originalFileName: string | null = null;
    let workspaceId = 'a0000000-0000-0000-0000-000000000001';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || '';
      meetingDate = (formData.get('meeting_date') as string) || '';
      workspaceId = (formData.get('workspace_id') as string) || workspaceId;

      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file was provided in the upload request.' },
          { status: 400 }
        );
      }

      originalFileName = file.name;
      const fileBytes = await file.arrayBuffer();
      const buffer = Buffer.from(fileBytes);
      const mime = file.type || '';

      if (mime.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i)) {
        sourceType = 'audio';
        const transResult = await audioTranscriptionService.transcribeAudio(
          buffer,
          mime,
          file.name
        );
        transcript = transResult.transcript;
      } else {
        sourceType = file.name.endsWith('.pdf') ? 'pdf' : 'txt';
        transcript = await transcriptService.extractTextFromBuffer(buffer, mime, file.name);
      }
    } else {
      const body = await req.json();
      title = body.title;
      meetingDate = body.meeting_date;
      sourceType = body.source_type || 'paste';
      transcript = body.transcript;
      originalFileName = body.original_file_name || null;
      workspaceId = body.workspace_id || workspaceId;
    }

    // Validate payload
    const validated = MeetingIngestRequestSchema.parse({
      title,
      meeting_date: meetingDate,
      source_type: sourceType,
      transcript: transcriptService.cleanTranscript(transcript),
      original_file_name: originalFileName,
      workspace_id: workspaceId,
    });

    const newMeeting = await dbStore.createMeeting({
      workspace_id: validated.workspace_id,
      title: validated.title,
      meeting_date: validated.meeting_date,
      source_type: validated.source_type,
      transcript: validated.transcript,
      original_file_name: validated.original_file_name,
      processing_status: 'pending',
      summary: null,
      key_topics: [],
    });

    return NextResponse.json({
      success: true,
      meeting: newMeeting,
      message: 'Meeting ingested successfully and ready for AI intelligence pipeline.',
    });
  } catch (err: any) {
    console.error('Ingest error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to ingest meeting transcript.',
      },
      { status: 400 }
    );
  }
}
