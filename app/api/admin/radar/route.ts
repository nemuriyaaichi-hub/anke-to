import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getRadarItems, saveRadarItems } from '@/lib/sheets';
import { RadarItem } from '@/types';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await getRadarItems();
  return NextResponse.json(items.sort((a, b) => a.order - b.order));
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items: RadarItem[] = await req.json();
  await saveRadarItems(items);
  return NextResponse.json({ ok: true });
}
