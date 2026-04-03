import { google } from 'googleapis';
import { Question, RadarItem, SurveyResponse, RadarScore, DEFAULT_QUESTIONS, DEFAULT_RADAR_ITEMS } from '@/types';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// ==================== Questions ====================

export async function getQuestions(): Promise<Question[]> {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'questions!A2:F',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return DEFAULT_QUESTIONS;
    return rows.map((r) => ({
      id: r[0],
      text: r[1],
      reversed: r[2] === 'TRUE',
      radarItem: r[3] || '',
      order: parseInt(r[4] || '0'),
      weight: parseInt(r[5] || '2'),
    }));
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  const sheets = getSheetsClient();
  const values = questions.map((q) => [q.id, q.text, q.reversed ? 'TRUE' : 'FALSE', q.radarItem, q.order, q.weight ?? 2]);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'questions!A2',
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  // Clear extra rows
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `questions!A${values.length + 2}:F1000`,
  });
}

// ==================== Radar Items ====================

export async function getRadarItems(): Promise<RadarItem[]> {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'radar_items!A2:D',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return DEFAULT_RADAR_ITEMS;
    return rows.map((r) => ({
      id: r[0],
      name: r[1],
      description: r[2] || '',
      order: parseInt(r[3] || '0'),
    }));
  } catch {
    return DEFAULT_RADAR_ITEMS;
  }
}

export async function saveRadarItems(items: RadarItem[]): Promise<void> {
  const sheets = getSheetsClient();
  const values = items.map((i) => [i.id, i.name, i.description, i.order]);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'radar_items!A2',
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `radar_items!A${values.length + 2}:D1000`,
  });
}

// ==================== Survey Response ====================

export async function saveResponse(response: SurveyResponse, scores: RadarScore): Promise<void> {
  const sheets = getSheetsClient();
  const questions = await getQuestions();

  // responses sheet
  const answerValues = questions.map((q) => response.answers[q.id] ?? '');
  const responseRow = [response.sessionId, response.timestamp, ...answerValues];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'responses!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [responseRow] },
  });

  // radar_scores sheet
  const radarItems = await getRadarItems();
  const scoreValues = radarItems.map((ri) => scores.scores[ri.id] ?? '');
  const scoreRow = [scores.sessionId, scores.timestamp, ...scoreValues];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'radar_scores!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [scoreRow] },
  });
}

export async function getResponses(): Promise<Record<string, string>[]> {
  try {
    const sheets = getSheetsClient();
    const questions = await getQuestions();

    // Ensure header
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'responses!A1:1',
    });
    if (!headerRes.data.values || headerRes.data.values.length === 0) {
      const headers = ['sessionId', 'timestamp', ...questions.map((q) => q.text)];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'responses!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'responses!A1:ZZ',
    });
    const rows = res.data.values;
    if (!rows || rows.length <= 1) return [];
    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  } catch {
    return [];
  }
}

export async function initSheets(): Promise<void> {
  try {
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = meta.data.sheets?.map((s) => s.properties?.title) || [];
    const required = ['responses', 'radar_scores', 'questions', 'radar_items'];
    const toCreate = required.filter((name) => !existingSheets.includes(name));
    if (toCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: toCreate.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      });
    }

    // Write headers
    const questions = DEFAULT_QUESTIONS;
    const radarItems = DEFAULT_RADAR_ITEMS;
    const updates = [
      { range: 'questions!A1:F1', values: [['id', 'text', 'reversed', 'radarItem', 'order', 'weight']] },
      { range: 'radar_items!A1:D1', values: [['id', 'name', 'description', 'order']] },
      { range: 'responses!A1', values: [['sessionId', 'timestamp', ...questions.map((q) => q.text)]] },
      { range: 'radar_scores!A1', values: [['sessionId', 'timestamp', ...radarItems.map((r) => r.name)]] },
    ];
    for (const u of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: u.range,
        valueInputOption: 'RAW',
        requestBody: { values: u.values },
      });
    }

    // Write default data if empty
    const qRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'questions!A2' });
    if (!qRes.data.values) {
      await saveQuestions(DEFAULT_QUESTIONS);
    }
    const rRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'radar_items!A2' });
    if (!rRes.data.values) {
      await saveRadarItems(DEFAULT_RADAR_ITEMS);
    }
  } catch (e) {
    console.error('initSheets error:', e);
  }
}
