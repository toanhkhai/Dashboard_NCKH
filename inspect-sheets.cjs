const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function inspect() {
  const url1 = 'https://docs.google.com/spreadsheets/d/1Tg9evoX-lIykGi_F5z4FwXU2Hhy9af7UFGNz30f4lwo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=1298748218';
  const url2 = 'https://docs.google.com/spreadsheets/d/1T36gWiDQkD07cXwHUA82J4hfFWHEC9pj4VD-PwHNADo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=287019159';

  const csv1 = await fetchUrl(url1);
  console.log('=== SHEET 1 ===');
  console.log('Total bytes:', csv1.length);
  // Quick parse check
  const lines1 = csv1.split('\n');
  console.log('First 500 chars:', csv1.slice(0, 500));

  const csv2 = await fetchUrl(url2);
  console.log('=== SHEET 2 ===');
  console.log('Total bytes:', csv2.length);
  console.log('First 500 chars:', csv2.slice(0, 500));
}

inspect().catch(console.error);
