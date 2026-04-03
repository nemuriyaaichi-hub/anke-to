import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getQuestions, saveQuestions } from '@/lib/sheets';
import { Question } from '@/types';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const questions = await getQuestions();
  return NextResponse.json(questions.sort((a, b) => a.order - b.order));
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const questions: Question[] = await req.json();
  await saveQuestions(questions);
  return NextResponse.json({ ok: true });
}
