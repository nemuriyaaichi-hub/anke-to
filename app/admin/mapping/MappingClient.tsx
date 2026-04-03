'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question, RadarItem } from '@/types';

export default function MappingClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [radarItems, setRadarItems] = useState<RadarItem[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/mapping')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setQuestions(data.questions.sort((a: Question, b: Question) => a.order - b.order));
        setRadarItems(data.radarItems.sort((a: RadarItem, b: RadarItem) => a.order - b.order));
        const map: Record<string, string> = {};
        data.questions.forEach((q: Question) => { map[q.id] = q.radarItem || ''; });
        setMapping(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/mapping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping),
    });
    setSaving(false);
    setMessage(res.ok ? '保存しました ✓' : '保存に失敗しました');
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="text-slate-400 animate-pulse">読み込み中...</div>
    </div>
  );

  // Count questions per radar item
  const countMap: Record<string, number> = {};
  Object.values(mapping).forEach((rid) => {
    if (rid) countMap[rid] = (countMap[rid] || 0) + 1;
  });

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto w-full"
      style={{ background: 'var(--background)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-slate-500 hover:text-slate-300">←</button>
        <h1 className="text-lg font-bold text-slate-100">設問↔項目 紐付け</h1>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        各設問がどのレーダー項目に関連するかを設定します。Geminiはこの対応を参考にスコアを算出します。
      </p>

      {/* Coverage summary */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--card)' }}>
        <h2 className="text-xs text-slate-400 mb-3 font-semibold">項目別 設問数</h2>
        <div className="grid grid-cols-2 gap-2">
          {radarItems.map((ri) => (
            <div key={ri.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate pr-2">{ri.name}</span>
              <span
                className="font-bold px-2 py-0.5 rounded"
                style={{
                  background: (countMap[ri.id] || 0) === 0 ? '#450a0a' : '#1e1b4b',
                  color: (countMap[ri.id] || 0) === 0 ? '#fca5a5' : 'var(--accent-light)',
                }}
              >
                {countMap[ri.id] || 0}問
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid #1e293b' }}>
            <div className="text-xs text-indigo-400 font-semibold mb-2">Q{i + 1}</div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">{q.text}</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">関連するレーダー項目</label>
              <select
                value={mapping[q.id] || ''}
                onChange={(e) => setMapping({ ...mapping, [q.id]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm text-slate-100 outline-none"
                style={{ background: '#0a0f1e', border: '1px solid #1e293b' }}
              >
                <option value="">-- 未設定 --</option>
                {radarItems.map((ri) => (
                  <option key={ri.id} value={ri.id}>{ri.name}</option>
                ))}
              </select>
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
