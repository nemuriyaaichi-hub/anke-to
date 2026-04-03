'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/admin/questions', icon: '📝', label: '設問管理', desc: '設問の追加・編集・削除' },
  { href: '/admin/radar', icon: '📊', label: 'レーダー項目管理', desc: '6項目の名称・説明を編集' },
  { href: '/admin/mapping', icon: '🔗', label: '設問↔項目 紐付け', desc: '設問とレーダー項目の対応設定' },
  { href: '/admin/responses', icon: '📋', label: '回答データ一覧', desc: 'スプレッドシートのデータを閲覧' },
];

export default function AdminDashboardClient() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-md mx-auto w-full"
      style={{ background: 'var(--background)' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-100">管理者ダッシュボード</h1>
          <p className="text-xs text-slate-500 mt-1">睡眠アンケート管理</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ログアウト
        </button>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98"
            style={{ background: 'var(--card)', border: '1px solid #1e293b' }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="font-semibold text-slate-100 text-sm">{item.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
            </div>
            <span className="ml-auto text-slate-600">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl" style={{ background: 'var(--card)' }}>
        <p className="text-xs text-slate-500">
          設問やレーダー項目を変更した場合、次回のアンケートから反映されます。
          変更前のデータはスプレッドシートに保持されます。
        </p>
      </div>
    </div>
  );
}
