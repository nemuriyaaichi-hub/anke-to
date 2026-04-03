import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getResponses } from '@/lib/sheets';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const responses = await getResponses();
  return NextResponse.json(responses);
}
