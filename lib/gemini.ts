import { Question, RadarItem, RadarScore } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.0-flash';

interface GeminiCandidate {
  content: { parts: { text: string }[] };
}
interface GeminiResponse {
  candidates: GeminiCandidate[];
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data: GeminiResponse = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function analyzeWithGemini(
  answers: Record<string, number>,
  questions: Question[],
  radarItems: RadarItem[]
): Promise<RadarScore['scores']> {
  // Build Q&A list
  const qaList = questions
    .sort((a, b) => a.order - b.order)
    .map((q) => {
      const score = answers[q.id] ?? null;
      const scoreLabel = score
        ? `${score}（${['', '大変不満', '不満', 'どちらともいえない', '満足', '大変満足'][score]}）`
        : '未回答';
      const weightLabel = ['', '低', '中', '高'][q.weight ?? 2];
      const notes = [
        q.reversed ? '逆転スコア（高スコアほど悪い状態）' : '',
        `重み:${weightLabel}`,
      ].filter(Boolean).join(' / ');
      return `Q[${q.id}]: ${q.text} → ${scoreLabel}（${notes}）`;
    })
    .join('\n');

  // Build mapping
  const mappingList = radarItems
    .sort((a, b) => a.order - b.order)
    .map((ri) => {
      const relatedQs = questions.filter((q) => q.radarItem === ri.id);
      const qDetail = relatedQs.map((q) => `${q.id}(重み:${ ['', '低', '中', '高'][q.weight ?? 2]}${q.reversed ? ',逆転' : ''})`).join(', ');
      return `・${ri.name}（${ri.description}）: 関連設問 = ${qDetail || 'なし'}`;
    })
    .join('\n');

  const radarItemNames = radarItems.map((ri) => ri.name).join(', ');

  const prompt = `あなたは睡眠専門家です。以下のアンケート回答を分析し、睡眠の6項目それぞれのスコア（1.0〜5.0）を算出してください。

【アンケート回答】
${qaList}

【レーダーチャート項目と関連設問の対応】
${mappingList}

【スコア算出ルール】
- 各項目スコアは関連する設問の回答を参考に1.0〜5.0の範囲で算出
- 逆転スコアの設問は「高回答＝悪い状態」として解釈
- 未回答設問は平均値（3.0）として扱う
- 複数の関連設問がある場合は総合的に評価

以下のJSON形式のみで返答してください（説明文は不要）:
{
${radarItems.map((ri) => `  "${ri.id}": <スコア数値>`).join(',\n')}
}`;

  try {
    const text = await callGemini(prompt);
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);
    // Validate and clamp scores
    const scores: Record<string, number> = {};
    for (const ri of radarItems) {
      const val = parseFloat(parsed[ri.id]);
      scores[ri.id] = isNaN(val) ? 3.0 : Math.min(5.0, Math.max(1.0, val));
    }
    return scores;
  } catch (e) {
    console.error('Gemini parse error:', e);
    // Fallback: compute scores locally
    return computeLocalScores(answers, questions, radarItems);
  }
}

function computeLocalScores(
  answers: Record<string, number>,
  questions: Question[],
  radarItems: RadarItem[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const ri of radarItems) {
    const relatedQs = questions.filter((q) => q.radarItem === ri.id);
    if (relatedQs.length === 0) {
      scores[ri.id] = 3.0;
      continue;
    }
    const vals = relatedQs.map((q) => {
      const raw = answers[q.id] ?? 3;
      return q.reversed ? 6 - raw : raw;
    });
    scores[ri.id] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }
  return scores;
}
