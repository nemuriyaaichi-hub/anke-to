import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSession, clearAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password, action } = await req.json();
  if (action === 'logout') {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }
  if (await verifyAdminPassword(password)) {
    await setAdminSession();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
}
