// Vercel serverless function — proxies OSINT Industries API calls
// The OI_API_KEY stays server-side, never reaches the browser
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OI_API_KEY not configured' });
  }

  try {
    const upstream = await fetch('https://api.osint.industries/v2/request', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(upstream.status).send(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
