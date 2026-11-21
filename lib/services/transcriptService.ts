// ==============================================================================
// MEETWISE AI — TRANSCRIPT SERVICE
// Ingestion, sanitization, speaker turn parsing, and file extraction
// ==============================================================================

export interface ParsedDialogueLine {
  speaker: string;
  text: string;
  raw: string;
}

export const transcriptService = {
  // Sanitize and clean raw input transcript
  cleanTranscript(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
      .trim();
  },

  // Parse lines into speaker turns
  parseDialogueLines(transcript: string): ParsedDialogueLine[] {
    const cleaned = this.cleanTranscript(transcript);
    const lines = cleaned.split('\n');
    const parsed: ParsedDialogueLine[] = [];

    // Regex matching "Speaker Name: message" or "[00:12] Speaker: message"
    const speakerRegex = /^(?:\[[\d:]+\]\s*)?([A-Za-z0-9\s._-]+?)\s*:\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const match = trimmed.match(speakerRegex);
      if (match) {
        parsed.push({
          speaker: match[1].trim(),
          text: match[2].trim(),
          raw: trimmed,
        });
      } else {
        // Continuation of previous line or unspecified speaker
        if (parsed.length > 0) {
          parsed[parsed.length - 1].text += ' ' + trimmed;
          parsed[parsed.length - 1].raw += '\n' + trimmed;
        } else {
          parsed.push({
            speaker: 'Unknown',
            text: trimmed,
            raw: trimmed,
          });
        }
      }
    }

    return parsed;
  },

  // Extract text from text/plain, text/markdown or buffer
  async extractTextFromBuffer(
    buffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    if (mimeType.includes('text') || filename.endsWith('.txt') || filename.endsWith('.md')) {
      return buffer.toString('utf-8');
    }

    if (mimeType.includes('pdf') || filename.endsWith('.pdf')) {
      // Safe text extraction from PDF buffer:
      // Search for text chunks in standard PDF stream patterns
      const raw = buffer.toString('latin1');
      const textMatches: string[] = [];
      const streamRegex = /BT[\s\S]*?ET/g;
      const matches = raw.match(streamRegex);

      if (matches && matches.length > 0) {
        for (const match of matches) {
          // Extract text inside parentheses: (Text) Tj or [(T)(e)(x)(t)] TJ
          const parenMatches = match.match(/\((.*?)\)\s*Tj/g);
          if (parenMatches) {
            for (const pm of parenMatches) {
              const text = pm.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
              if (text.trim()) textMatches.push(text);
            }
          }
        }
      }

      if (textMatches.length > 0) {
        return textMatches.join(' ');
      }

      // Fallback: extract printable ASCII sequences from the PDF
      const asciiOnly = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const cleanTokens = asciiOnly
        .split(/\s+/)
        .filter((tok) => tok.length > 2 && !tok.includes('/') && !tok.includes('obj'))
        .join(' ');

      if (cleanTokens.length > 50) {
        return cleanTokens;
      }

      throw new Error(
        'Unable to extract readable text from PDF. Please export the document as TXT or paste the transcript directly.'
      );
    }

    throw new Error(`Unsupported file format (${mimeType}). Supported formats: TXT, Markdown, PDF, Audio.`);
  },
};
