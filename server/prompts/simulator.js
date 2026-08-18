const DOMAIN_FLAVOR = {
  "financial-ops": {
    label: "Financial Ops",
    systems: "an OMS / FIX trade-routing gateway, clearing pipeline, or market-data feed",
  },
  "job-scheduling": {
    label: "Job Scheduling",
    systems: "a distributed cron/batch scheduler, ETL pipeline, or workflow orchestrator",
  },
  "api-gateway": {
    label: "API Gateway",
    systems: "an API gateway, load balancer, or edge/CDN layer in front of microservices",
  },
  "db-replication": {
    label: "DB Replication",
    systems: "a primary/replica database cluster, change-data-capture pipeline, or multi-region replication setup",
  },
};

export function scenarioPrompt(domain) {
  const flavor = DOMAIN_FLAVOR[domain] || DOMAIN_FLAVOR["api-gateway"];
  return [
    {
      role: "system",
      content:
        "You design realistic on-call incident training scenarios for SREs. " +
        "Respond with ONLY a single JSON object, no prose, no markdown fences.",
    },
    {
      role: "user",
      content: `Design one incident scenario in the domain: ${flavor.label}, involving ${flavor.systems}.

Return JSON with this exact shape:
{
  "brief": {
    "system": "specific system name, e.g. 'Charles River OMS'",
    "detected_time": "HH:MM AM/PM EST",
    "impact": "one sentence, plain English business impact"
  },
  "logs": [
    "HH:MM:SS LEVEL message"
  ],
  "true_rca": {
    "timeline": [{ "time": "HH:MM", "event": "short description" }],
    "root_cause": "one sentence, the real underlying cause",
    "contributing_factors": ["short bullet", "short bullet"],
    "trigger": "the specific event that triggered the incident"
  }
}

Generate 20-30 log lines. LEVEL must be one of ERROR, WARN, INFO. Mix in 40-60% noise/red-herring lines (routine INFO chatter, unrelated warnings) alongside the real signal lines that lead to the true root cause — a good on-call engineer should be able to distinguish them, but it shouldn't be trivially obvious. Logs must be internally consistent with true_rca.`,
    },
  ];
}

export function gradePrompt({ brief, trueRca, triage, elapsedSeconds }) {
  return [
    {
      role: "system",
      content:
        "You are a strict but fair SRE incident-response grader. " +
        "Respond with ONLY a single JSON object, no prose, no markdown fences.",
    },
    {
      role: "user",
      content: `Incident brief: ${JSON.stringify(brief)}
Elapsed time to resolution: ${elapsedSeconds} seconds

True root cause analysis (ground truth, not shown to the responder until now):
${JSON.stringify(trueRca, null, 2)}

Responder's triage submission:
Severity: ${triage.severity}
Affected systems: ${triage.affectedSystems}
Root cause hypothesis: ${triage.rootCauseHypothesis}
Escalation decision: ${triage.escalation}

Grade the submission. Return JSON with this exact shape:
{
  "severity_accuracy": 0-100,
  "rca_match_pct": 0-100,
  "decision_quality": 0-100,
  "feedback": "2-3 sentences of direct, specific feedback on what they got right/wrong"
}`,
    },
  ];
}
