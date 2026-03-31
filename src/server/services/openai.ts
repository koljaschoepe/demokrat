/**
 * Shared OpenAI API helper for all AI services.
 * Uses direct fetch — no openai npm package needed.
 */

interface OpenAIChatResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
}

/**
 * Calls OpenAI Chat Completions API with given prompts.
 * Returns the trimmed content string from the first choice.
 */
export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  return content.trim();
}

/**
 * Strips markdown code fences from a string (e.g., ```json ... ```).
 * Useful for parsing JSON responses from OpenAI.
 */
export function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
}
