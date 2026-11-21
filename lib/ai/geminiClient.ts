// ==============================================================================
// MEETWISE AI — GEMINI CLIENT & MODEL CONFIGURATION
// Team Meteor — Product Space AI Agentic Hackathon
// ==============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(
  apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey.length > 10
);

let genAIInstance: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!isGeminiConfigured) return null;
  if (!genAIInstance && apiKey) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export function getGeminiModel(
  modelName: string = 'gemini-1.5-flash',
  systemInstruction?: string
) {
  const client = getGeminiClient();
  if (!client) return null;

  return client.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      responseMimeType: 'application/json',
    },
  });
}
