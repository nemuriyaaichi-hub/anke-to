'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResponsesClient() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/responses')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setResponses(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  function downloadCSV() {
    if (responses.length === 0) return;
    const headers = Object.keys(responses[0]);
    const rows = responses.map((r) =>
      headers.map((h) => `"${(r[h] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="text-slate-400 animate-pulse">読み込み中...</div>
    </div>
  );

  const headers = responses.length > 0 ? Object.keys(responses[0]) : [];

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-full mx-auto w-full"
      style={{ background: 'var(--background)' }}>
      <div className="flex items-center gap-3 mb-6 max-w-md mx-auto w-full">
        <button onClick={() => router.push('/admin')} className="text-slate-500 hover:text-slate-300">←</button>
        <h1 className="text-lg font-bold text-slate-100">回答データ一覧</h1>
        <button
          onClick={downloadCSV}
          disabled={responses.length === 0}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40"
          style={{ background: 'var(--card)', color: 'var(--accent-light)', border: '1px solid #1e293b' }}
        >
          CSV出力
        </button>
      </div>

      <div className="text-xs text-slate-500 mb-4 max-w-md mx-auto w-full">
        {responses.length}件のデータ
      </div>

      {responses.length === 0 ? (
        <div className="text-center text-slate-500 mt-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">回答データがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--card)' }}>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap"
                    style={{ border: '1px solid #1e293b', maxWidth: '150px' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#0d1526' : 'var(--background)' }}>
                  {headers.map((h) => (
                    <td
                      key={h}
                      className="px-3 py-2 text-slate-300 whitespace-nowrap"
                      style={{ border: '1px solid #1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={row[h]}
                    >
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
