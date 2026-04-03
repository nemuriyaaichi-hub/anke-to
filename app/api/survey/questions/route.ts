import { NextResponse } from 'next/server';
import { getQuestions, getRadarItems } from '@/lib/sheets';

export async function GET() {
  const [questions, radarItems] = await Promise.all([getQuestions(), getRadarItems()]);
  return NextResponse.json({ questions: questions.sort((a, b) => a.order - b.order), radarItems });
}
