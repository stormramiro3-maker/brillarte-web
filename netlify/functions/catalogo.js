const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';
const SITE_ID = 'd59b87e3-503d-4053-94e0-67880239c607';

let cache = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Endpoint para cron-job — devuelve solo OK
  if (event.path === '/.netlify/functions/catalogo/ping') {
    if (!cache || !cacheTime || (Date.now() - cacheTime) >= CACHE_TTL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL);
        cache = await res.json();
        cacheTime = Date.now();
      } catch(e) {}
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (event.queryStringParameters?.refresh === REFRESH_KEY) {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      cache = await res.json();
      cacheTime = Date.now();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Cache actualizado' }) };
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
