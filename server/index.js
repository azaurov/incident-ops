import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { chat, parseJson } from "./llm.js";
import { extractPrompt, narratePrompt } from "./prompts/postmortem.js";
import { scenarioPrompt, gradePrompt } from "./prompts/simulator.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// --- Postmortem Autopilot ---

app.post("/api/extract", async (req, res) => {
  try {
    const { metadata = {}, mode = "notes", rawText = "" } = req.body || {};
    if (!rawText.trim()) {
      return res.status(400).json({ error: "rawText is required" });
    }
    const raw = await chat(extractPrompt({ metadata, mode, rawText }), { json: true });
    const extracted = parseJson(raw);
    res.json(extracted);
  } catch (err) {
    console.error("[extract]", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/narrate", async (req, res) => {
  try {
    const { metadata = {}, extracted } = req.body || {};
    if (!extracted) {
      return res.status(400).json({ error: "extracted is required" });
    }
    const raw = await chat(narratePrompt({ metadata, extracted }), { json: true });
    const narrated = parseJson(raw);
    res.json(narrated);
  } catch (err) {
    console.error("[narrate]", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Incident Simulator ---
// scenarioId -> { brief, trueRca } — the true RCA never leaves the server
// until /api/grade is called, so the game can't be cheated via devtools.
const scenarios = new Map();

app.post("/api/scenario", async (req, res) => {
  try {
    const { domain } = req.body || {};
    if (!domain) return res.status(400).json({ error: "domain is required" });

    const raw = await chat(scenarioPrompt(domain), { json: true });
    const { brief, logs, true_rca } = parseJson(raw);

    const scenarioId = crypto.randomUUID();
    scenarios.set(scenarioId, { brief, trueRca: true_rca });

    res.json({ scenarioId, brief, logs });
  } catch (err) {
    console.error("[scenario]", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/grade", async (req, res) => {
  try {
    const { scenarioId, triage, elapsedSeconds } = req.body || {};
    const entry = scenarios.get(scenarioId);
    if (!entry) {
      return res.status(404).json({ error: "Unknown or already-graded scenarioId" });
    }

    const raw = await chat(
      gradePrompt({ brief: entry.brief, trueRca: entry.trueRca, triage, elapsedSeconds }),
      { json: true }
    );
    const grade = parseJson(raw);

    scenarios.delete(scenarioId); // single-use: prevent re-grading / cheating

    res.json({ ...grade, true_rca: entry.trueRca });
  } catch (err) {
    console.error("[grade]", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`incident-ops server on :${PORT}`));
