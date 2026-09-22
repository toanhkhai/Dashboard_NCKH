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

async function inspectSheet2() {
  const url2 = 'https://docs.google.com/spreadsheets/d/1T36gWiDQkD07cXwHUA82J4hfFWHEC9pj4VD-PwHNADo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=287019159';
  const csv2 = await fetchUrl(url2);
  const parsed2 = Papa.parse(csv2, {
    header: true,
    skipEmptyLines: 'greedy',
    quoteChar: '"',
    escapeChar: '"',
    transformHeader: (h) => h.trim(),
  });
  
  const qRanks = new Set();
  const categories = new Set();
  parsed2.data.forEach(row => {
    Object.keys(row).forEach(k => {
      if (k.toLowerCase().includes('chất lượng q') || k.toLowerCase().includes('xếp hạng')) {
        qRanks.add(row[k]);
      }
      if (k.toLowerCase().includes('danh mục')) {
        categories.add(row[k]);
      }
    });
  });

  console.log('Sheet 2 Q-Ranks:', Array.from(qRanks));
  console.log('Sheet 2 Categories:', Array.from(categories));
}

inspectSheet2().catch(console.error);
