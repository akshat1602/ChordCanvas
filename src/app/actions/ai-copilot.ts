'use server';

import OpenAI from 'openai';
import { z } from 'zod';

const Analysis = z.object({
  theory: z.object({
    detected_key: z.string(),
    roman_numeral_analysis: z.array(z.string()),
    harmonic_summary: z.string(),
  }),
  songwriting: z.object({
    recommended_scales: z.array(z.string()),
    lyrical_themes: z.array(z.string()),
    vocal_melody_tip: z.string(),
  }),
});

export type AnalysisResult = z.infer<typeof Analysis>;

// Point the standard OpenAI client to Groq's API endpoint
const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function analyseProgression(chords: string[]) {
  try {
    const res = await client.chat.completions.create({
      model: 'openai/gpt-oss-20b', // Updated active Groq model
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a music theory assistant. Reply with JSON only, '
          + 'using keys: theory{detected_key, roman_numeral_analysis[], harmonic_summary}, '
          + 'songwriting{recommended_scales[], lyrical_themes[], vocal_melody_tip}.' },
        { role: 'user', content: `Progression: ${chords.join(' | ')}` },
      ],
    });

    const parsed = Analysis.safeParse(JSON.parse(res.choices[0].message.content ?? '{}'));
    
    if (!parsed.success) return { ok: false as const, error: 'Invalid AI response' };
    
    return { ok: true as const, data: parsed.data };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { ok: false as const, error: 'Failed to analyze progression' };
  }
}