const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

async function generateTaskDescription(req, res) {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Please provide a task title.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      message: 'AI description is unavailable. Add GEMINI_API_KEY to backend/.env. You can still create tasks normally.'
    });
  }

  const prompt = [
    'Write a clear, useful task description for a task management application.',
    'Use 2 to 4 short sentences. Explain the goal and practical steps.',
    'Do not add a deadline, priority, or facts that are not implied by the title.',
    `Task title: ${title.trim()}`
  ].join('\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 180 }
        }),
        signal: controller.signal
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage = data?.error?.message;
      const status = response.status === 429 ? 429 : 502;
      return res.status(status).json({
        message: response.status === 429
          ? 'The AI service rate limit was reached. Please try again later.'
          : `The AI service could not generate a description${providerMessage ? `: ${providerMessage}` : '.'}`
      });
    }

    const description = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')
      .trim();

    if (!description) {
      return res.status(502).json({ message: 'The AI service returned an empty response. Please try again.' });
    }

    return res.json({ description });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ message: 'The AI request timed out. You can continue creating the task without AI.' });
    }
    return res.status(502).json({ message: 'Unable to contact the AI service. You can still create tasks normally.' });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { generateTaskDescription };
