const https = require('https');
const Papa = require('papaparse');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalizeKey(str) {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findCol(row, candidates) {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const normCand = normalizeKey(cand);
    const found = keys.find(k => normalizeKey(k).includes(normCand));
    if (found) return found;
  }
  return null;
}

function extractScore(val) {
  if (!val) return 0;
  const str = String(val).replace(',', '.');
  const match = str.match(/[0-9]+(\.[0-9]+)?/);
  return match ? parseFloat(match[0]) : 0;
}

function extractYear(val) {
  if (!val) return 'Chưa rõ';
  const str = String(val).trim();
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) return match[1];
  const parts = str.split(/[/.-]/);
  if (parts.length >= 3) {
    const y = parts[2].trim();
    if (y.length === 4 && !isNaN(Number(y))) return y;
  }
  return 'Khác';
}

function extractProof(val) {
  if (!val) return [];
  const str = String(val);
  const matches = str.match(/(https?:\/\/[^\s,;"<>]+)/g) || [];
  return Array.from(new Set(matches.map(u => u.trim().replace(/[.,;]+$/, ''))));
}

async function test() {
  const url1 = 'https://docs.google.com/spreadsheets/d/1Tg9evoX-lIykGi_F5z4FwXU2Hhy9af7UFGNz30f4lwo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=1298748218';
  const csv1 = await fetchUrl(url1);
  const p1 = Papa.parse(csv1, {
    header: true,
    skipEmptyLines: 'greedy',
    quoteChar: '"',
    escapeChar: '"',
    transformHeader: (h) => h.trim()
  });

  const scoresCount = {};
  const yearsCount = {};
  let totalScore1 = 0;
  let proofCount1 = 0;

  p1.data.forEach((r, idx) => {
    const scoreKey = findCol(r, ['số điểm', 'điểm', 'score']);
    const score = scoreKey ? extractScore(r[scoreKey]) : 0;
    scoresCount[score] = (scoresCount[score] || 0) + 1;
    totalScore1 += score;

    const dateKey = findCol(r, ['ngày', 'date']);
    const yr = dateKey ? extractYear(r[dateKey]) : 'Chưa rõ';
    yearsCount[yr] = (yearsCount[yr] || 0) + 1;

    const proofKey = findCol(r, ['minh chứng', 'drive.google.com']);
    const proofs = proofKey ? extractProof(r[proofKey]) : [];
    if (proofs.length > 0) proofCount1++;
  });

  console.log('=== SHEET 1 NORMALIZATION RESULTS ===');
  console.log('Total valid records:', p1.data.length);
  console.log('Total HĐGS Score:', totalScore1.toFixed(2));
  console.log('Avg HĐGS Score:', (totalScore1 / p1.data.length).toFixed(2));
  console.log('Proof Links found:', `${proofCount1}/${p1.data.length} (${((proofCount1/p1.data.length)*100).toFixed(1)}%)`);
  console.log('Score distribution:', scoresCount);
  console.log('Years distribution:', yearsCount);
}

test().catch(console.error);
