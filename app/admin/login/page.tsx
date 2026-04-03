'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      const data = await res.json();
      setError(data.error || 'ログイン失敗');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4"
      style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-slate-100">管理者ログイン</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-slate-100 outline-none focus:ring-2"
              style={{
                background: 'var(--card)',
                border: '1px solid #1e293b',
                // @ts-expect-error CSS variable not in type
                '--tw-ring-color': 'var(--accent)',
              }}
              placeholder="パスワードを入力"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
