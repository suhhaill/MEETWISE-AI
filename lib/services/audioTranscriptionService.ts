// ==============================================================================
// MEETWISE AI — AUDIO TRANSCRIPTION SERVICE
// Transcribes uploaded audio (.mp3, .wav, .m4a, .webm) using Gemini Multimodal Audio
// ==============================================================================

import { getGeminiClient, isGeminiConfigured } from '@/lib/ai/geminiClient';

export interface AudioTranscriptionResult {
  transcript: string;
  duration_seconds?: number;
  detected_speakers: string[];
  is_simulated: boolean;
}

export const audioTranscriptionService = {
  // Validate audio file format and size (max 25MB for hackathon payload)
  validateAudio(mimeType: string, sizeBytes: number): { valid: boolean; error?: string } {
    const supportedMimes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/webm',
      'audio/ogg',
    ];

    const isSupported =
      supportedMimes.some((m) => mimeType.toLowerCase().includes(m.split('/')[1])) ||
      mimeType.startsWith('audio/');

    if (!isSupported) {
      return {
        valid: false,
        error: `Unsupported audio format (${mimeType}). Please upload MP3, WAV, M4A, or WEBM.`,
      };
    }

    const maxBytes = 25 * 1024 * 1024; // 25MB
    if (sizeBytes > maxBytes) {
      return {
        valid: false,
        error: `Audio file is too large (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB). Limit is 25MB.`,
      };
    }

    return { valid: true };
  },

  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<AudioTranscriptionResult> {
    const validation = this.validateAudio(mimeType, audioBuffer.length);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // If Gemini is configured, use Gemini 1.5 Flash multimodal audio transcription
    if (isGeminiConfigured) {
      const client = getGeminiClient();
      if (!client) {
        throw new Error('Gemini API client could not be initialized.');
      }

      try {
        const model = client.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction:
            'You are a professional audio meeting transcriptionist. Transcribe the given meeting recording accurately. Format the output with clear speaker attributions when distinguishable (e.g. Speaker 1: ..., Speaker 2: ... or Name: ...). Preserve verbatim commitments, deadlines, and dates.',
        });

        const base64Audio = audioBuffer.toString('base64');
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType.startsWith('audio/') ? mimeType : 'audio/mp3',
              data: base64Audio,
            },
          },
          {
            text: 'Transcribe this entire meeting audio recording with speaker labels and verbatim quotes.',
          },
        ]);

        const text = result.response.text();
        return {
          transcript: text,
          detected_speakers: ['Speaker 1', 'Speaker 2'],
          is_simulated: false,
        };
      } catch (err: any) {
        console.error('Gemini audio transcription error:', err);
        throw new Error(
          `Audio transcription via Gemini failed: ${err.message || 'Unknown error'}. Please paste the transcript text directly.`
        );
      }
    }

    // If Gemini is NOT configured, provide an honest, structured fallback explanation
    throw new Error(
      'Live audio transcription requires GEMINI_API_KEY to be configured in your environment or Settings. Alternatively, please paste or upload the meeting text transcript directly.'
    );
  },
};
