const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const siteID = context.site?.id;
  const token = process.env.NETLIFY_API_TOKEN;
  const blobUrl = `https://api.netlify.com/api/v1/blobs/${siteID}/catalogo/cache`;
  const isRefresh = event.queryStringParameters?.refresh === REFRESH_KEY;

  if (!isRefresh) {
    try {
      const cached = await fetch(blobUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cached.ok) {
        const data = await cached.json();
        return { statusCode: 200, headers: { ...headers, 'X-Cache': 'HIT' }, body: JSON.stringify(data) };
      }
    } catch(e) {}
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    await fetch(blobUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return { statusCode: 200, headers: { ...headers, 'X-Cache': 'MISS' }, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
