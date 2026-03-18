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

  // Ping para cron-job
  if (params.ping === 'true') {
    if (!cache || !cacheTime || (Date.now() - cacheTime) >= CACHE_TTL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL);
        cache = await res.json();
        cacheTime = Date.now();
      } catch(e) {}
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

  // Servir desde caché
  if (cache && cacheTime && (Date.now() - cacheTime) < CACHE_TTL) {
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'HIT' }, body: JSON.stringify(cache) };
  }

  // Cargar desde Apps Script
  try {
    con
