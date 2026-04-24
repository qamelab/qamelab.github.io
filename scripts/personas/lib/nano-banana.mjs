/**
 * Generate an image with Google's "Nano Banana" (gemini-2.5-flash-image).
 *
 * Uses OpenRouter as the proxy by default — the free tier of Google's
 * direct Gemini API has limit=0 on this preview model, so OpenRouter is
 * both cheaper and the only practical route.
 *
 * Returns { mimeType, base64 } for the first inline-image in the response.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash-image';

export async function nanoBananaImage({ apiKey, prompt, model = DEFAULT_MODEL }) {
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
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter (image) ${res.status}: ${body}`);
  }

  const data = await res.json();
  const msg = data?.choices?.[0]?.message;
  const images = msg?.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    // OpenRouter returns either { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } }
    // or { image_url: '...' } depending on model variant.
    const url = first?.image_url?.url ?? first?.image_url ?? first?.url ?? first;
    if (typeof url === 'string' && url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) return { mimeType: match[1], base64: match[2] };
    }
  }
  throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 600)}`);
}

export function extFromMime(mime) {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  return 'png';
}
