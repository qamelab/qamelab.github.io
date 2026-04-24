const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call an OpenRouter chat-completions model.
 * Returns the first choice's message content.
 */
export async function openrouterChat({
  apiKey,
  model,
  system,
  user,
  temperature = 0.9,
  maxTokens = 1200,
}) {
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in env');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://qamelab.org',
      'X-Title': 'QAME Lab - persona portrait pipeline',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenRouter: empty response\n${JSON.stringify(data)}`);
  return content.trim();
}
