import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: 'var(--background)' }}>
      <div className="mb-8">
        <div className="text-6xl mb-4">🌙</div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--accent-light)' }}>
          睡眠アンケート
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
          いくつかの質問に答えることで、あなたの睡眠状態をレーダーチャートで可視化します。
        </p>
      </div>

      <div className="rounded-2xl p-6 max-w-xs w-full mb-8 text-left"
        style={{ background: 'var(--card)' }}>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">アンケートについて</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            全8問・5段階評価
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            所要時間：約2〜3分
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            回答後にレーダーチャートを表示
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            個人情報の入力は不要
          </li>
        </ul>
      </div>

      <Link
        href="/survey/1"
        className="w-full max-w-xs py-4 rounded-2xl text-lg font-bold text-white text-center transition-all active:scale-95"
        style={{ background: 'var(--accent)' }}
      >
        アンケートを始める
      </Link>

      <p className="mt-6 text-xs text-slate-600">
        <Link href="/admin/login" className="hover:text-slate-400">管理者ページ</Link>
      </p>
    </main>
  );
}
