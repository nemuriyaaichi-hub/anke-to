import { NextRequest, NextResponse } from 'next/server';
import { getQuestions, getRadarItems, saveResponse, initSheets } from '@/lib/sheets';
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

  // シート初期化 → 保存（失敗しても結果は返す）
  try {
    await initSheets();
    await saveResponse(response, radarScore);
  } catch (e) {
    console.warn('Sheets save skipped:', e);
  }

  return NextResponse.json({ scores, radarItems });
}
