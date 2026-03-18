const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySaC7CZufMVK-MoJ6Ry_nZYAJV3ouTtqb5w3oKjat8_w39n7hVSW_G0c8fpTX91P3RDA/exec';
const REFRESH_KEY = 'brillarte2025';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const siteID = context.site?.id;
  const token = process.env.NETLIFY_API_TOKEN;

  if (event.queryStringParameters?.refresh === REFRESH_KEY) {
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        debug: true,
        siteID: siteID || 'UNDEFINED',
        tokenPresent: !!token,
        tokenPrefix: token ? token.substring(0, 10) : 'NONE'
      }) 
    };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
