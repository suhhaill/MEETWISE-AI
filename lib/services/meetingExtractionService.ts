// ==============================================================================
// MEETWISE AI — MEETING EXTRACTION SERVICE
// Dedicated Gemini 1.5/2.0 Structured Intelligence Pipeline with Zod Validation
// ==============================================================================

import { getGeminiModel, isGeminiConfigured } from '@/lib/ai/geminiClient';
import {
  MeetingExtractionSchema,
  ValidatedMeetingExtraction,
} from '@/lib/validation/schemas';
import { SAMPLE_TRANSCRIPTS } from '@/lib/database/demoData';

export interface ExtractionExecutionResult {
  data: ValidatedMeetingExtraction;
  is_live_ai: boolean;
  model_used: string;
  tokens_used?: number;
}

const EXTRACTION_SYSTEM_PROMPT = `You are MEETWISE AI's senior meeting intelligence extraction engine for Team Meteor.
Your role is to rigorously extract confirmed decisions, proposed changes, commitments, and verifiable action items from meeting conversations.

CRITICAL RULES FOR ACCURACY:
1. Evidence-Backed: Every decision, proposed change, and task MUST include a verbatim "evidence_quote" directly copied from the transcript.
2. No Hallucinations:
   - If an owner/assignee is not explicitly identified or accepted by a speaker, "owner_name" MUST BE null.
   - If a deadline or date is not mentioned or is completely ambiguous, "due_date" MUST BE null (do not guess).
   - If a speaker's name cannot be discerned, use "Unknown". Do not invent names.
3. Separation of Concerns:
   - Suggestions and ideas must NEVER be labeled as confirmed decisions.
   - Proposed changes (e.g., "we are considering changing X to Y") must be placed under "proposed_changes", NOT confirmed decisions.
   - A decision is ONLY "confirmed" if the team or key decision maker explicitly agreed or finalized it.
4. Date Normalization:
   - When speakers mention relative days (e.g., "by this Friday", "next Tuesday", "December 15"), resolve them relative to the provided MEETING DATE. Format dates strictly as YYYY-MM-DD. If ambiguous, set to null.
5. Confidence Scoring: Provide a calibrated confidence score between 0.0 and 1.0 based on explicit language and certainty.

OUTPUT STRICTLY VALID JSON MATCHING THIS SCHEMA:
{
  "meeting_summary": "Concise factual summary (2-4 sentences)",
  "key_topics": ["Topic 1", "Topic 2"],
  "decisions": [
    {
      "description": "Clear statement of what was decided",
      "decision_type": "confirmed" | "proposed" | "deprecated",
      "speaker": "Speaker Name",
      "evidence_quote": "Verbatim transcript sentence",
      "confidence": 0.95
    }
  ],
  "proposed_changes": [
    {
      "description": "Description of proposed change",
      "speaker": "Speaker Name",
      "evidence_quote": "Verbatim transcript sentence",
      "confidence": 0.90
    }
  ],
  "suggestions": [
    {
      "topic": "Topic",
      "speaker": "Speaker Name",
      "suggestion": "Idea description"
    }
  ],
  "open_questions": [
    {
      "question": "Unresolved question",
      "raised_by": "Speaker Name",
      "assigned_to": "Person or null"
    }
  ],
  "tasks": [
    {
      "title": "Action-oriented task title",
      "description": "Action details",
      "owner_name": "Person Name or null",
      "due_date": "YYYY-MM-DD or null",
      "source_speaker": "Speaker Name",
      "evidence_quote": "Verbatim transcript sentence",
      "confidence": 0.98
    }
  ],
  "missing_information": ["Missing deadline for task X", "Ambiguous owner for item Y"]
}`;

export const meetingExtractionService = {
  async extractIntelligence(
    transcript: string,
    meetingTitle: string,
    meetingDate: string
  ): Promise<ExtractionExecutionResult> {
    if (!transcript || transcript.trim().length < 10) {
      throw new Error('Transcript is too short or empty to extract intelligence.');
    }

    // 1. LIVE GEMINI EXTRACTION
    if (isGeminiConfigured) {
      const model = getGeminiModel('gemini-1.5-flash', EXTRACTION_SYSTEM_PROMPT);
      if (!model) {
        throw new Error('Failed to initialize Gemini model.');
      }

      const userPrompt = `MEETING METADATA:
Title: "${meetingTitle}"
Meeting Reference Date: ${meetingDate}

TRANSCRIPT:
"""
${transcript}
"""

Extract structured intelligence according to the strict instructions and return ONLY valid JSON.`;

      // Attempt 1 with retry on JSON parse failure
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await model.generateContent(userPrompt);
          const rawText = response.response.text();
          
          // Clean JSON markdown blocks if present
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('Gemini response did not contain a valid JSON object.');
          }

          const parsed = JSON.parse(jsonMatch[0]);
          const validated = MeetingExtractionSchema.parse(parsed);

          return {
            data: validated,
            is_live_ai: true,
            model_used: 'Gemini 1.5 Flash (Official API)',
          };
        } catch (err: any) {
          if (attempt === 2) {
            console.error('Gemini extraction failed after 2 attempts:', err);
            throw new Error(
              `AI meeting extraction failed: ${err.message || 'Invalid structured output'}. Please verify transcript formatting and try again.`
            );
          }
          console.warn(`Extraction attempt ${attempt} failed, retrying...`, err);
        }
      }
    }

    // 2. DEMO / SIMULATION MODE FALLBACK
    // If user is running the Wednesday Launch Date demo meeting
    const isWednesdayDemo =
      transcript.includes('moving the launch from December 10 to December 15') ||
      meetingTitle.toLowerCase().includes('wednesday');

    if (isWednesdayDemo) {
      const demoResult: ValidatedMeetingExtraction = {
        meeting_summary:
          'Mid-sprint launch sync reviewed the public release timeline. David proposed rescheduling launch from December 10 to December 15 due to payment partner sandbox testing delays. Alex committed to complete responsive checkout by December 8, and Emma will update marketing assets by December 7.',
        key_topics: [
          'Launch Timeline Revision',
          'Payment Gateway Sandbox Testing',
          'QA Coverage Verification',
          'Marketing Collateral Update',
        ],
        decisions: [],
        proposed_changes: [
          {
            description:
              'Proposal to shift public release date from December 10, 2026 to December 15, 2026',
            speaker: 'David',
            evidence_quote:
              'Due to payment partner sandbox testing delays, we are considering moving the launch from December 10 to December 15.',
            confidence: 0.96,
          },
        ],
        suggestions: [
          {
            topic: 'Testing extra room',
            speaker: 'Alex',
            suggestion: 'Use additional 5 days to ensure responsive payment flow is 100% bug-free',
          },
        ],
        open_questions: [],
        tasks: [
          {
            title: 'Ensure responsive payment flow and error states are 100% bug free',
            description: 'Polish frontend Stripe checkout elements and error handling states.',
            owner_name: 'Alex',
            due_date: '2026-12-08',
            source_speaker: 'Alex',
            evidence_quote:
              'If we move the launch to December 15, I can ensure the responsive payment flow and error states are 100% bug free by December 8.',
            confidence: 0.98,
          },
          {
            title: 'Update marketing collateral and landing page badges with new launch date',
            description: 'Revise public landing page announcement badges and social banners.',
            owner_name: 'Emma',
            due_date: '2026-12-07',
            source_speaker: 'Emma',
            evidence_quote:
              'I will update all marketing collateral and landing page badges to reflect the December 15 date by December 7.',
            confidence: 0.97,
          },
        ],
        missing_information: [],
      };

      return {
        data: demoResult,
        is_live_ai: false,
        model_used: 'Demo Simulation Engine (Add GEMINI_API_KEY in Settings for Live Gemini API)',
      };
    }

    // Generic heuristic extraction for arbitrary text in demo mode without API key
    return {
      data: meetingExtractionService.heuristicFallbackExtraction(transcript, meetingTitle, meetingDate),
      is_live_ai: false,
      model_used: 'Demo Heuristic Engine (Add GEMINI_API_KEY in Settings for Live Gemini API)',
    };
  },

  heuristicFallbackExtraction(
    transcript: string,
    title: string,
    meetingDate: string
  ): ValidatedMeetingExtraction {
    const lines = transcript.split('\n').filter((l) => l.trim().length > 0);
    const decisions: any[] = [];
    const tasks: any[] = [];
    const topics: string[] = ['Team Alignment', 'Action Planning'];

    for (const line of lines) {
      const lower = line.toLowerCase();
      const speakerMatch = line.match(/^([A-Za-z0-9\s._-]+?)\s*:\s*(.+)$/);
      const speaker = speakerMatch ? speakerMatch[1].trim() : 'Unknown';
      const content = speakerMatch ? speakerMatch[2].trim() : line.trim();

      if (
        lower.includes('decided') ||
        lower.includes('agreed') ||
        lower.includes('confirmed') ||
        lower.includes('locked in')
      ) {
        decisions.push({
          description: content,
          decision_type: 'confirmed',
          speaker,
          evidence_quote: line.trim(),
          confidence: 0.92,
        });
      } else if (
        lower.includes('will ') ||
        lower.includes('should ') ||
        lower.includes('action item') ||
        lower.includes('by ')
      ) {
        // Look for date pattern like "by December 5" or "by 2026-12-05"
        const dateMatch = content.match(/by\s+([A-Za-z]+\s+\d{1,2}|\d{4}-\d{2}-\d{2})/i);
        tasks.push({
          title: content.slice(0, 80),
          description: content,
          owner_name: speaker !== 'Unknown' ? speaker : null,
          due_date: dateMatch ? '2026-12-05' : null,
          source_speaker: speaker,
          evidence_quote: line.trim(),
          confidence: 0.88,
        });
      }
    }

    return {
      meeting_summary: `Meeting "${title}" conducted on ${meetingDate}. Reviewed progress and outlined critical team commitments with ${lines.length} dialogue turns.`,
      key_topics: topics,
      decisions: decisions.slice(0, 4),
      proposed_changes: [],
      suggestions: [],
      open_questions: [],
      tasks: tasks.slice(0, 5),
      missing_information: [],
    };
  },
};
