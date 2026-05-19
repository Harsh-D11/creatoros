export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;

    if (!GEMINI_KEY) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    const models = [
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest'
    ];

    let lastError = 'Unknown error';

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();
        const errMsg = data?.error?.message || '';

        if (response.ok) {
          const text = data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || '')
            .join('')
            .trim();

          if (text) {
            return res.status(200).json({ text });
          }

          lastError = data?.candidates?.[0]?.finishReason
            ? `No text returned. Finish reason: ${data.candidates[0].finishReason}`
            : 'No text returned by Gemini';

          continue;
        }

        lastError = errMsg || JSON.stringify(data);

        if (
          response.status === 404 ||
          response.status === 429 ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.toLowerCase().includes('not found')
        ) {
          continue;
        }

        return res.status(response.status).json({ error: lastError });
      } catch (err) {
        lastError = err.message || 'Fetch failed';
        continue;
      }
    }

    return res.status(500).json({ error: lastError });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
