export interface Question {
  id: string;
  text: string;
  order: number;
  reversed: boolean; // 逆転スコア
  radarItem: string; // 関連レーダー項目ID
}

export interface RadarItem {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface MappingEntry {
  questionId: string;
  radarItemId: string;
  weight: number; // 1-3
}

export interface SurveyResponse {
  sessionId: string;
  timestamp: string;
  answers: Record<string, number>; // questionId -> score(1-5)
}

export interface RadarScore {
  sessionId: string;
  timestamp: string;
  scores: Record<string, number>; // radarItemId -> score(1.0-5.0)
}

export const SCORE_LABELS: Record<number, string> = {
  5: '大変満足',
  4: '満足',
  3: 'どちらともいえない',
  2: '不満',
  1: '大変不満',
};

export const DEFAULT_QUESTIONS: Question[] = [
  { id: 'q1', text: '最近1週間、布団に入ってから眠りにつくまでの時間はどうでしたか？', order: 1, reversed: false, radarItem: 'r1' },
  { id: 'q2', text: '眠りの深さはいかがでしたか？', order: 2, reversed: false, radarItem: 'r2' },
  { id: 'q3', text: '夜中に目が覚めることはありましたか？（頻繁に覚めた＝不満）', order: 3, reversed: true, radarItem: 'r3' },
  { id: 'q4', text: '睡眠時間は十分でしたか？', order: 4, reversed: false, radarItem: 'r4' },
  { id: 'q5', text: '朝の目覚めはいかがでしたか？', order: 5, reversed: false, radarItem: 'r5' },
  { id: 'q6', text: '日中の眠気や集中力への影響はありましたか？（影響が大きい＝不満）', order: 6, reversed: true, radarItem: 'r6' },
  { id: 'q7', text: '全体的な睡眠の質に満足していますか？', order: 7, reversed: false, radarItem: 'r1' },
  { id: 'q8', text: 'ストレスや悩みが睡眠に影響していると感じますか？（影響大＝不満）', order: 8, reversed: true, radarItem: 'r2' },
];

export const DEFAULT_RADAR_ITEMS: RadarItem[] = [
  { id: 'r1', name: '入眠のしやすさ', description: '布団に入ってから眠れるまでの状態', order: 1 },
  { id: 'r2', name: '睡眠の深さ', description: '深く眠れているか', order: 2 },
  { id: 'r3', name: '中途覚醒', description: '夜中に目が覚めるか（少ない方が良い）', order: 3 },
  { id: 'r4', name: '睡眠時間の充足感', description: '十分な時間眠れているか', order: 4 },
  { id: 'r5', name: '目覚めの快適さ', description: '起床時のすっきり感', order: 5 },
  { id: 'r6', name: '日中の活動への影響', description: '日中の眠気・集中力への影響（少ない方が良い）', order: 6 },
];
