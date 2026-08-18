import { chat, parseJson } from "./llm.js";
import { extractPrompt, narratePrompt } from "./prompts/postmortem.js";
import { scenarioPrompt, gradePrompt } from "./prompts/simulator.js";

const SCENARIO_TTL_SECONDS = 60 * 30; // grading window

function corsHeaders(origin, allowedOrigin) {
  const allow = allowedOrigin === "*" || origin === allowedOrigin ? origin || "*" : allowedOrigin;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function handleExtract(req, env, headers) {
  const { metadata = {}, mode = "notes", rawText = "" } = (await req.json()) || {};
  if (!rawText.trim()) return json({ error: "rawText is required" }, 400, headers);
  const raw = await chat(env, extractPrompt({ metadata, mode, rawText }), { json: true });
  return json(parseJson(raw), 200, headers);
}

async function handleNarrate(req, env, headers) {
  const { metadata = {}, extracted } = (await req.json()) || {};
  if (!extracted) return json({ error: "extracted is required" }, 400, headers);
  const raw = await chat(env, narratePrompt({ metadata, extracted }), { json: true });
  return json(parseJson(raw), 200, headers);
}

async function handleScenario(req, env, headers) {
  const { domain } = (await req.json()) || {};
  if (!domain) return json({ error: "domain is required" }, 400, headers);

  const raw = await chat(env, scenarioPrompt(domain), { json: true });
  const { brief, logs, true_rca } = parseJson(raw);

  const scenarioId = crypto.randomUUID();
  await env.SCENARIOS.put(scenarioId, JSON.stringify({ brief, trueRca: true_rca }), {
    expirationTtl: SCENARIO_TTL_SECONDS,
  });

  return json({ scenarioId, brief, logs }, 200, headers);
}

async function handleGrade(req, env, headers) {
  const { scenarioId, triage, elapsedSeconds } = (await req.json()) || {};
  const stored = await env.SCENARIOS.get(scenarioId);
  if (!stored) return json({ error: "Unknown or already-graded scenarioId" }, 404, headers);
  const entry = JSON.parse(stored);

  const raw = await chat(
    env,
    gradePrompt({ brief: entry.brief, trueRca: entry.trueRca, triage, elapsedSeconds }),
    { json: true }
  );
  const grade = parseJson(raw);

  await env.SCENARIOS.delete(scenarioId); // single-use: prevent re-grading / cheating

  return json({ ...grade, true_rca: entry.trueRca }, 200, headers);
}

const ROUTES = {
  "/api/extract": handleExtract,
  "/api/narrate": handleNarrate,
  "/api/scenario": handleScenario,
  "/api/grade": handleGrade,
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const headers = corsHeaders(origin, allowedOrigin);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const handler = ROUTES[url.pathname];
    if (!handler || req.method !== "POST") {
      return json({ error: "Not found" }, 404, headers);
    }

    try {
      return await handler(req, env, headers);
    } catch (err) {
      console.error(`[${url.pathname}]`, err);
      return json({ error: err.message }, 500, headers);
    }
  },
};
