const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';

let cache = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const params = event.queryStringParameters || {};

  // Ping para cron-job — responde OK inmediatamente y recarga en background
  if (params.ping === 'true') {
    if (!cache || !cacheTime || (Date.now() - cacheTime) >= CACHE_TTL) {
      fetch(APPS_SCRIPT_URL)
        .then(r => r.json())
        .then(data => { cache = data; cacheTime = Date.now(); })
        .catch(() => {});
    }
    return { statusCode: 200, headers, body: '{"ok":true}' };
  }

  // Refresh manual
  if (params.refresh === REFRESH_KEY) {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      cache = await res.json();
      cacheTime = Date.now();
      return { statusCode: 200, headers, body: '{"ok":true,"message":"Cache actualizado"}' };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  if (cache && cacheTime && (Date.now() - cacheTime) < CACHE_TTL) {
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'HIT' }, body: JSON.stringify(cache) };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    cache = await res.json();
    cacheTime = Date.now();
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'MISS' }, body: JSON.stringify(cache) };
  } catch(e) {
    if (cache) return { statusCode: 200, headers, body: JSON.stringify(cache) };
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
