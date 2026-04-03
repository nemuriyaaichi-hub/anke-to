'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RadarItem } from '@/types';

export default function RadarClient() {
  const router = useRouter();
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/radar')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  function updateItem(id: string, field: keyof RadarItem, value: string | number) {
    setItems(items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function handleSave() {
    if (items.length !== 6) {
      setMessage('レーダー項目は必ず6つ必要です');
      return;
    }
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/radar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    setSaving(false);
    setMessage(res.ok ? '保存しました ✓' : '保存に失敗しました');
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="text-slate-400 animate-pulse">読み込み中...</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto w-full"
      style={{ background: 'var(--background)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-slate-500 hover:text-slate-300">←</button>
        <h1 className="text-lg font-bold text-slate-100">レーダー項目管理</h1>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        レーダーチャートの6項目を編集できます。項目名と説明を変更するとGeminiの解析にも反映されます。
      </p>

      <div className="space-y-3 mb-6">
        {items.sort((a, b) => a.order - b.order).map((item, i) => (
          <div key={item.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {i + 1}
              </div>
              <span className="text-xs text-slate-500">項目 {i + 1}</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">項目名</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-100 outline-none"
                  style={{ background: '#0a0f1e', border: '1px solid #1e293b' }}
                  placeholder="項目名"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">説明（Gemini解析のヒントになります）</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-100 outline-none"
                  style={{ background: '#0a0f1e', border: '1px solid #1e293b' }}
                  placeholder="説明"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <p className={`text-sm text-center mb-3 ${message.includes('✓') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{ background: 'var(--accent)' }}
      >
        {saving ? '保存中...' : '保存する'}
      </button>
    </div>
  );
}
