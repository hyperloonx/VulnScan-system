/**
 * Claude AI integration for generating AI-powered remediation recommendations.
 * Requires an Anthropic API key stored in the VITE_ANTHROPIC_API_KEY env variable.
 *
 * Falls back to built-in remediation text when the API key is not configured.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Check whether the Anthropic API key is configured.
 */
export function isClaudeAvailable() {
  return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
}

/**
 * Fetch an AI-powered remediation recommendation from Claude.
 *
 * @param {Object} finding - The vulnerability finding object.
 * @returns {Promise<string>} AI-generated remediation guidance.
 */
export async function getAIRemediation(finding) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not configured.');
  }

  const prompt = `You are a senior application security engineer. Provide concise, actionable remediation guidance for the following web application vulnerability:

**Vulnerability**: ${finding.title}
**Category**: ${finding.category} (OWASP ${finding.categoryId})
**Severity**: ${finding.severity}
**CVSS Score**: ${finding.cvssScore}

Provide:
1. A brief explanation of why this is dangerous (2 sentences max)
2. Specific remediation steps (numbered list, 3-5 steps)
3. A code example or configuration snippet if applicable (use markdown code blocks)
4. One recommended security tool or library for prevention

Keep the response focused and practical. Format using markdown.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No guidance returned from AI.';
}
