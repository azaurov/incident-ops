# Incident Ops

Simulate an incident, triage it against the clock, get graded against the hidden truth — then watch the Autopilot tab's real extract→narrate pipeline write up the post-mortem from the same raw logs, the same way it would for anyone pasting logs in directly.

## Setup

```
npm run install:all
npm run dev
```

Client: http://localhost:5174 · Server: http://localhost:4001

`server/.env` already has `GROQ_API_KEY` set. `OPENROUTER_API_KEY` is blank — fill it in if you want automatic fallback when Groq rate-limits (429). Groq's per-minute token limit is easy to hit during heavy testing without it.

## How it works

One Express server, four routes, one Groq-backed `llm.js` (`llama-3.3-70b-versatile`, OpenRouter free-tier fallback):

- `/api/extract`, `/api/narrate` — the Postmortem Autopilot pipeline: turn raw incident data (Slack/logs/notes) into structured facts, then a written summary/RCA/action items.
- `/api/scenario` — generates an incident brief + streaming logs for one of four domains. The true root cause is kept server-side (in-memory, keyed by `scenarioId`) and never sent to the browser until grading.
- `/api/grade` — scores a submitted triage against the hidden true root cause (severity accuracy / RCA match / decision quality) and reveals it. Deliberately does **not** generate the post-mortem doc itself.

After grading, the Simulate tab feeds the scenario's actual log lines through `/api/extract` + `/api/narrate` — the same calls the Autopilot tab makes — so the final doc reflects what the evidence in the logs actually shows, which may differ slightly from the ground truth revealed in the score card. That's intentional: it's the same tool doing the same job either way, whether you paste logs in yourself or the simulator generated them.

One client, one tab switcher (`Simulate` / `Autopilot`), shared `PostmortemDoc`/export components between both flows.
