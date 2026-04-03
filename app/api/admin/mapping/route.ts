import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getQuestions, getRadarItems, saveQuestions } from '@/lib/sheets';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [questions, radarItems] = await Promise.all([getQuestions(), getRadarItems()]);
  return NextResponse.json({ questions, radarItems });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // mapping: { questionId -> radarItemId }
  const mapping: Record<string, string> = await req.json();
  const questions = await getQuestions();
  const updated = questions.map((q) => ({
    ...q,
    radarItem: mapping[q.id] ?? q.radarItem,
  }));
  await saveQuestions(updated);
  return NextResponse.json({ ok: true });
}
