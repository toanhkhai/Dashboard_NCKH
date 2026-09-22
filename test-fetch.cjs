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

async function run() {
  const url1 = 'https://docs.google.com/spreadsheets/d/1Tg9evoX-lIykGi_F5z4FwXU2Hhy9af7UFGNz30f4lwo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=1298748218';
  const url2 = 'https://docs.google.com/spreadsheets/d/1T36gWiDQkD07cXwHUA82J4hfFWHEC9pj4VD-PwHNADo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=287019159';

  console.log('Fetching Sheet 1...');
  const csv1 = await fetchUrl(url1);
  console.log('Sheet 1 bytes:', csv1.length);

  console.log('Fetching Sheet 2...');
  const csv2 = await fetchUrl(url2);
  console.log('Sheet 2 bytes:', csv2.length);
}

run().catch(console.error);
