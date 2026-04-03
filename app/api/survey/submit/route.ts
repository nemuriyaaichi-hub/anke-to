import { NextRequest, NextResponse } from 'next/server';
import { getQuestions, getRadarItems, saveResponse } from '@/lib/sheets';
import { analyzeWithGemini } from '@/lib/gemini';
import { RadarScore, SurveyResponse } from '@/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, answers } = body as { sessionId: string; answers: Record<string, number> };

  if (!sessionId || !answers) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const [questions, radarItems] = await Promise.all([getQuestions(), getRadarItems()]);

  // Gemini analysis
  const scores = await analyzeWithGemini(answers, questions, radarItems);

  const response: SurveyResponse = { sessionId, timestamp, answers };
  const radarScore: RadarScore = { sessionId, timestamp, scores };

  await saveResponse(response, radarScore);

  return NextResponse.json({ scores, radarItems });
}
