export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + GEMINI_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const text = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: text });
      }

      const errMsg = (data.error && data.error.message) ? data.error.message : '';
      if (errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        continue;
      }

      return res.status(response.status).json({ error: errMsg || JSON.stringify(data) });

    } catch (e) {
      continue;
    }
  }

  return res.status(429).json({ error: 'All Gemini models are rate limited. Please wait a minute and try again.' });
}
