const { getStore } = require('@netlify/blobs');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';
const CACHE_KEY = 'catalogo';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const store = getStore({ name: 'brillarte', consistency: 'strong' });

  if (event.queryStringParameters?.refresh === REFRESH_KEY) {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();
      await store.setJSON(CACHE_KEY, data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Cache actualizado' }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  try {
    const cached = await store.get(CACHE_KEY, { type: 'json' });
    if (cached) {
      return { statusCode: 200, headers: { ...headers, 'X-Cache': 'HIT' }, body: JSON.stringify(cached) };
    }
  } catch(e) {}

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    await store.setJSON(CACHE_KEY, data);
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'MISS' }, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
