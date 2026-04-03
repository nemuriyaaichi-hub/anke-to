'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function QuestionsClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/questions')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  function addQuestion() {
    const newQ: Question = {
      id: uuidv4(),
      text: '',
      order: questions.length + 1,
      reversed: false,
      radarItem: '',
    };
    setQuestions([...questions, newQ]);
  }

  function removeQuestion(id: string) {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(updated);
  }

  function updateQuestion(id: string, field: keyof Question, value: string | boolean | number) {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  }

  function moveQuestion(index: number, direction: 'up' | 'down') {
    const arr = [...questions];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setQuestions(arr.map((q, i) => ({ ...q, order: i + 1 })));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
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
        <h1 className="text-lg font-bold text-slate-100">設問管理</h1>
      </div>

      <div className="space-y-3 mb-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-indigo-400 font-semibold w-6">Q{i + 1}</span>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => moveQuestion(i, 'up')} disabled={i === 0}
                  className="text-slate-500 hover:text-slate-300 disabled:opacity-30 text-sm px-1">↑</button>
                <button onClick={() => moveQuestion(i, 'down')} disabled={i === questions.length - 1}
                  className="text-slate-500 hover:text-slate-300 disabled:opacity-30 text-sm px-1">↓</button>
                <button onClick={() => removeQuestion(q.id)}
                  className="text-red-500 hover:text-red-400 text-sm px-1 ml-2">削除</button>
              </div>
            </div>

            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-slate-100 resize-none outline-none focus:ring-1 mb-3"
              style={{ background: '#0a0f1e', border: '1px solid #1e293b' }}
              rows={2}
              placeholder="設問テキストを入力"
            />

            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={q.reversed}
                onChange={(e) => updateQuestion(q.id, 'reversed', e.target.checked)}
                className="rounded"
              />
              逆転スコア（高スコア＝悪い状態）
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full py-3 rounded-xl text-sm font-medium text-indigo-400 mb-4 transition-all"
        style={{ border: '1px dashed #4f46e5' }}
      >
        + 設問を追加
      </button>

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
