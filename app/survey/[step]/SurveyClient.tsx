'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Question, SCORE_LABELS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SurveyClientProps {
  step: number;
}

const SCORE_COLORS: Record<number, string> = {
  5: '#6366f1',
  4: '#818cf8',
  3: '#94a3b8',
  2: '#f59e0b',
  1: '#ef4444',
};

export default function SurveyClient({ step }: SurveyClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load or create session
    let sid = sessionStorage.getItem('survey_session');
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem('survey_session', sid);
    }
    setSessionId(sid);

    // Load saved answers
    const saved = sessionStorage.getItem('survey_answers');
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch { /* ignore */ }
    }

    // Fetch questions
    fetch('/api/survey/questions')
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentQuestion: Question | undefined = questions[step - 1];
  const total = questions.length;

  // Pre-fill if already answered
  useEffect(() => {
    if (currentQuestion) {
      setSelected(answers[currentQuestion.id] ?? null);
    }
  }, [currentQuestion, answers]);

  const handleSelect = useCallback(async (score: number) => {
    if (!currentQuestion || submitting) return;
    setSelected(score);

    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);
    sessionStorage.setItem('survey_answers', JSON.stringify(newAnswers));

    // Brief visual feedback then navigate
    await new Promise((r) => setTimeout(r, 300));

    if (step < total) {
      router.push(`/survey/${step + 1}`);
    } else {
      // Last question: submit
      setSubmitting(true);
      try {
        const res = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, answers: newAnswers }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        sessionStorage.setItem('survey_result', JSON.stringify(data));
        sessionStorage.removeItem('survey_answers');
        sessionStorage.removeItem('survey_session');
        router.push('/result');
      } catch (e) {
        setSubmitting(false);
        const msg = e instanceof Error ? e.message : '不明なエラー';
        alert(`送信エラー: ${msg}`);
      }
    }
  }, [currentQuestion, answers, step, total, sessionId, router, submitting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="text-slate-400 animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="text-slate-400">設問が見つかりません</div>
      </div>
    );
  }

  const progress = (step / total) * 100;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto w-full"
      style={{ background: 'var(--background)' }}>

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500">質問 {step} / {total}</span>
          <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: '#1e293b' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--card)' }}>
          <div className="text-xs text-indigo-400 font-semibold mb-3 uppercase tracking-wide">
            Q{step}
          </div>
          <p className="text-lg font-medium leading-relaxed text-slate-100">
            {currentQuestion.text}
          </p>
        </div>

        {/* Score buttons */}
        <div className="space-y-3">
          {([5, 4, 3, 2, 1] as const).map((score) => {
            const isSelected = selected === score;
            return (
              <button
                key={score}
                onClick={() => handleSelect(score)}
                disabled={submitting}
                className="w-full py-4 px-5 rounded-xl flex items-center justify-between transition-all duration-150 active:scale-98 disabled:opacity-50"
                style={{
                  background: isSelected ? SCORE_COLORS[score] : 'var(--card)',
                  border: `2px solid ${isSelected ? SCORE_COLORS[score] : '#1e293b'}`,
                  color: isSelected ? '#fff' : '#94a3b8',
                }}
              >
                <span className="font-bold text-lg" style={{ color: isSelected ? '#fff' : SCORE_COLORS[score] }}>
                  {score}
                </span>
                <span className="text-sm font-medium">
                  {SCORE_LABELS[score]}
                </span>
              </button>
            );
          })}
        </div>

        {submitting && (
          <div className="mt-6 text-center text-slate-400 animate-pulse">
            Geminiが分析中...
          </div>
        )}
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          onClick={() => router.push(`/survey/${step - 1}`)}
          className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← 前の質問に戻る
        </button>
      )}
    </div>
  );
}
