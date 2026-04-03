'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { RadarItem } from '@/types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ResultData {
  scores: Record<string, number>;
  radarItems: RadarItem[];
}

const SCORE_EMOJI: Record<number, string> = {
  5: '😴✨',
  4: '🌙',
  3: '😐',
  2: '😔',
  1: '😩',
};

function getOverallMessage(avg: number): { title: string; body: string } {
  if (avg >= 4.5) return { title: '睡眠の質：とても良好', body: '素晴らしい睡眠状態です！この生活習慣を続けましょう。' };
  if (avg >= 3.5) return { title: '睡眠の質：良好', body: '概ね良い睡眠が取れています。気になる項目を少し改善するとさらに良くなります。' };
  if (avg >= 2.5) return { title: '睡眠の質：普通', body: '一部の項目に改善の余地があります。生活習慣の見直しを検討してみてください。' };
  return { title: '睡眠の質：要改善', body: '複数の項目で課題が見られます。睡眠環境や生活習慣の改善を意識してみましょう。' };
}

export default function ResultClient() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('survey_result');
    if (!saved) {
      router.push('/');
      return;
    }
    try {
      setResult(JSON.parse(saved));
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="text-slate-400 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  const { scores, radarItems } = result;
  const sortedItems = [...radarItems].sort((a, b) => a.order - b.order);
  const labels = sortedItems.map((ri) => ri.name);
  const dataValues = sortedItems.map((ri) => scores[ri.id] ?? 3);
  const avg = dataValues.reduce((a, b) => a + b, 0) / dataValues.length;
  const message = getOverallMessage(avg);
  const avgEmoji = SCORE_EMOJI[Math.round(avg) as keyof typeof SCORE_EMOJI] || '🌙';

  const chartData = {
    labels,
    datasets: [
      {
        label: '睡眠スコア',
        data: dataValues,
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: 'rgba(99, 102, 241, 0.9)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(129, 140, 248, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#64748b',
          backdropColor: 'transparent',
          font: { size: 10 },
        },
        grid: { color: '#1e293b' },
        angleLines: { color: '#1e293b' },
        pointLabels: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { r: number } }) => ` ${ctx.parsed.r.toFixed(1)} / 5.0`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-md mx-auto w-full"
      style={{ background: 'var(--background)' }}>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{avgEmoji}</div>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--accent-light)' }}>
          {message.title}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">{message.body}</p>
      </div>

      {/* Overall score */}
      <div className="rounded-2xl p-4 mb-6 flex items-center justify-between"
        style={{ background: 'var(--card)' }}>
        <span className="text-sm text-slate-400">総合スコア</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold" style={{ color: 'var(--accent-light)' }}>
            {avg.toFixed(1)}
          </span>
          <span className="text-slate-500 text-sm">/ 5.0</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--card)' }}>
        <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-4 text-center">睡眠レーダーチャート</h2>
        <div className="w-full max-w-xs mx-auto">
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Score detail */}
      <div className="rounded-2xl p-4 mb-8" style={{ background: 'var(--card)' }}>
        <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-4">項目別スコア</h2>
        <div className="space-y-3">
          {sortedItems.map((ri) => {
            const score = scores[ri.id] ?? 3;
            const pct = (score / 5) * 100;
            const color = score >= 4 ? '#6366f1' : score >= 3 ? '#94a3b8' : score >= 2 ? '#f59e0b' : '#ef4444';
            return (
              <div key={ri.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{ri.name}</span>
                  <span className="font-bold" style={{ color }}>{score.toFixed(1)}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#1e293b' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          sessionStorage.clear();
          router.push('/');
        }}
        className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-95"
        style={{ background: 'var(--accent)' }}
      >
        もう一度回答する
      </button>
    </div>
  );
}
