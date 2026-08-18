import "dotenv/config";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const GROQ_MODEL = "openai/gpt-oss-120b";
const OPENROUTER_FALLBACK_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

async function postChat(url, apiKey, model, messages, json) {
  const body = {
    model,
    messages,
    temperature: 0.3,
    max_tokens: 4000,
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

// Calls Groq first; on failure (rate limit, retired/invalid model, etc.) falls
// back to OpenRouter's free tier if a key is configured, mirroring the pattern
// used in the Zeev project.
export async function chat(messages, { json = false } = {}) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in server/.env");
  }

  let res = await postChat(GROQ_URL, GROQ_API_KEY, GROQ_MODEL, messages, json);

  if (!res.ok && OPENROUTER_API_KEY) {
    res = await postChat(
      OPENROUTER_URL,
      OPENROUTER_API_KEY,
      OPENROUTER_FALLBACK_MODEL,
      messages,
      json
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Robust JSON parse: strips markdown code fences if the model added them.
export function parseJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  return JSON.parse(cleaned);
}
