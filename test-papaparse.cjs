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

async function testPapa() {
  const url1 = 'https://docs.google.com/spreadsheets/d/1Tg9evoX-lIykGi_F5z4FwXU2Hhy9af7UFGNz30f4lwo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=1298748218';
  const url2 = 'https://docs.google.com/spreadsheets/d/1T36gWiDQkD07cXwHUA82J4hfFWHEC9pj4VD-PwHNADo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=287019159';

  console.log('Fetching & Parsing Sheet 1 with PapaParse...');
  const csv1 = await fetchUrl(url1);
  const parsed1 = Papa.parse(csv1, {
    header: true,
    skipEmptyLines: 'greedy',
    quoteChar: '"',
    escapeChar: '"',
    transformHeader: (h) => h.trim(),
  });
  console.log('Sheet 1 Rows count:', parsed1.data.length);
  console.log('Sheet 1 Headers:', parsed1.meta.fields);
  console.log('Sheet 1 Sample Row 0:', parsed1.data[0]);

  console.log('\n---------------------------------\n');
  console.log('Fetching & Parsing Sheet 2 with PapaParse...');
  const csv2 = await fetchUrl(url2);
  const parsed2 = Papa.parse(csv2, {
    header: true,
    skipEmptyLines: 'greedy',
    quoteChar: '"',
    escapeChar: '"',
    transformHeader: (h) => h.trim(),
  });
  console.log('Sheet 2 Rows count:', parsed2.data.length);
  console.log('Sheet 2 Headers:', parsed2.meta.fields);
  console.log('Sheet 2 Sample Row 0:', parsed2.data[0]);
}

testPapa().catch(console.error);
