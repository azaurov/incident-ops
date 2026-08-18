const MODE_HINTS = {
  slack: "This is a raw Slack thread export. Messages may include usernames, timestamps in various formats, emoji reactions, and cross-talk. Reconstruct the true chronological event timeline, ignoring small talk.",
  logs: "This is raw application/system log output. Lines may include log levels (ERROR/WARN/INFO), stack traces, and repeated noise. Extract only the events that matter to the incident timeline.",
  notes: "This is free-form incident notes written by an engineer, possibly unordered or informal. Infer a chronological timeline from context.",
};

export function extractPrompt({ metadata, mode, rawText }) {
  const hint = MODE_HINTS[mode] || MODE_HINTS.notes;
  return [
    {
      role: "system",
      content:
        "You are an SRE incident-analysis assistant. You extract structured facts from messy incident data. " +
        "Respond with ONLY a single JSON object, no prose, no markdown fences.",
    },
    {
      role: "user",
      content: `Incident metadata:
Name: ${metadata.name || "(unnamed)"}
Date: ${metadata.date || "(unknown)"}
Severity: ${metadata.severity || "(unknown)"}
Reporter: ${metadata.reporter || "(unknown)"}

Input mode: ${mode}. ${hint}

Raw input:
"""
${rawText}
"""

Extract and return JSON with this exact shape:
{
  "timeline": [{ "time": "HH:MM or best guess", "event": "short description" }],
  "root_cause": "one sentence, best current hypothesis from the data",
  "contributing_factors": ["short bullet", "short bullet"],
  "trigger": "the specific event that triggered the incident"
}`,
    },
  ];
}

export function narratePrompt({ metadata, extracted }) {
  return [
    {
      role: "system",
      content:
        "You are an SRE writing a professional post-mortem. Be concise, plain-English, and specific. " +
        "Respond with ONLY a single JSON object, no prose, no markdown fences.",
    },
    {
      role: "user",
      content: `Incident: ${metadata.name || "(unnamed)"} | Severity: ${metadata.severity || "?"} | Date: ${metadata.date || "?"}

Extracted facts:
${JSON.stringify(extracted, null, 2)}

Return JSON with this exact shape:
{
  "summary": "one paragraph, plain English, what happened and business impact",
  "rca_narrative": "2-4 sentences of prose explaining the root cause in depth",
  "action_items": [
    { "text": "concrete follow-up task", "owner": "suggested team or role", "priority": "P1|P2|P3" }
  ]
}
Generate 3-5 action items.`,
    },
  ];
}
