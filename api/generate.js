export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const systemPrompt = `You are a professional SEO writer. Provide a comprehensive, high-quality blog article for the topic provided by the user. Include:
1. SEO Catchy Title
2. Meta Description (150 chars)
3. High Traffic Focus Keywords
4. Full Structured Article with headings (H2, H3), bullet points, and practical advice.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nTopic: ${prompt}` }] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'API Error');

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ text: reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
