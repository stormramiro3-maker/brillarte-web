const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';

let cache = null;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.queryStringParameters?.refresh === REFRESH_KEY) {
    cache = null;
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      cache = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Cache actualizado' }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  if (cache) {
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'HIT' }, body: JSON.stringify(cache) };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    cache = await res.json();
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'MISS' }, body: JSON.stringify(cache) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
