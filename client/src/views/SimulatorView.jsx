import { useEffect, useRef, useState } from "react";
import ScenarioPicker from "../components/ScenarioPicker";
import IncidentBrief from "../components/IncidentBrief";
import LogStream from "../components/LogStream";
import TriagePanel from "../components/TriagePanel";
import ScoreCard from "../components/ScoreCard";
import PostmortemDoc from "../components/PostmortemDoc";

const EMPTY_TRIAGE = { severity: "P1", affectedSystems: "", rootCauseHypothesis: "", escalation: "" };

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Stages: pick -> incident -> grading -> writing_doc -> graded
export default function SimulatorView() {
  const [stage, setStage] = useState("pick");
  const [loadingDomain, setLoadingDomain] = useState(null);
  const [scenario, setScenario] = useState(null); // { scenarioId, brief, logs }
  const [triage, setTriage] = useState(EMPTY_TRIAGE);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [frozenElapsed, setFrozenElapsed] = useState(0);
  const [grade, setGrade] = useState(null); // { severity_accuracy, rca_match_pct, decision_quality, feedback, true_rca }
  const [extracted, setExtracted] = useState(null); // autopilot's reconstruction from the raw logs
  const [narrated, setNarrated] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (stage === "incident") {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((Date.now() - start) / 1000);
      }, 250);
      return () => clearInterval(timerRef.current);
    }
  }, [stage]);

  async function handlePick(domain) {
    setError(null);
    setLoadingDomain(domain);
    try {
      const data = await postJson("/api/scenario", { domain });
      setScenario(data);
      setTriage(EMPTY_TRIAGE);
      setElapsedSeconds(0);
      setGrade(null);
      setExtracted(null);
      setNarrated(null);
      setStage("incident");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDomain(null);
    }
  }

  const postmortemMetadata = scenario
    ? {
        name: scenario.brief.system,
        date: new Date().toISOString().slice(0, 10),
        severity: triage.severity,
        reporter: "Autopilot",
      }
    : null;

  // Autopilot never sees the true RCA — it reconstructs a post-mortem the
  // same way it would for any user: from the raw incident logs.
  async function generateDocFromLogs() {
    const ext = await postJson("/api/extract", {
      metadata: postmortemMetadata,
      mode: "logs",
      rawText: scenario.logs.join("\n"),
    });
    setExtracted(ext);
    const nar = await postJson("/api/narrate", { metadata: postmortemMetadata, extracted: ext });
    setNarrated(nar);
  }

  async function handleSubmitTriage() {
    clearInterval(timerRef.current);
    const finalElapsed = elapsedSeconds;
    setFrozenElapsed(finalElapsed);
    setStage("grading");
    setError(null);
    try {
      const gradeData = await postJson("/api/grade", {
        scenarioId: scenario.scenarioId,
        triage,
        elapsedSeconds: Math.round(finalElapsed),
      });
      setGrade(gradeData);
      setStage("writing_doc");
      await generateDocFromLogs();
      setStage("graded");
    } catch (err) {
      setError(err.message);
      setStage(grade ? "writing_doc" : "incident"); // let them retry
    }
  }

  async function handleRegenerateDoc() {
    setRegenerating(true);
    setError(null);
    try {
      const nar = await postJson("/api/narrate", { metadata: postmortemMetadata, extracted });
      setNarrated(nar);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  function handleReset() {
    setScenario(null);
    setGrade(null);
    setExtracted(null);
    setNarrated(null);
    setStage("pick");
  }

  if (stage === "pick") {
    return (
      <div>
        <ScenarioPicker onPick={handlePick} loading={!!loadingDomain} loadingDomain={loadingDomain} />
        {error && (
          <div className="max-w-md mx-auto bg-alarm-dim/40 border border-alarm/40 text-alarm rounded-lg px-3 py-2 text-sm font-mono">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div />
        {stage === "graded" && (
          <button
            onClick={handleReset}
            className="text-xs uppercase tracking-wide text-ink-400 hover:text-ink-200 border border-ink-700 rounded px-3 py-1.5 transition"
          >
            New Scenario
          </button>
        )}
      </div>

      <IncidentBrief
        brief={scenario.brief}
        elapsedSeconds={stage === "incident" ? elapsedSeconds : frozenElapsed}
        resolved={stage === "graded" || stage === "writing_doc"}
      />

      {error && (
        <div className="bg-alarm-dim/40 border border-alarm/40 text-alarm rounded-lg px-3 py-2 text-sm font-mono">
          {error}
        </div>
      )}

      {(stage === "incident" || stage === "grading") && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <LogStream logs={scenario.logs} />
          <TriagePanel
            triage={triage}
            onChange={setTriage}
            onSubmit={handleSubmitTriage}
            submitting={stage === "grading"}
          />
        </div>
      )}

      {stage === "writing_doc" && grade && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <ScoreCard grade={grade} elapsedSeconds={frozenElapsed} />
          <div className="h-72 flex flex-col items-center justify-center border border-ink-700 rounded-xl text-ink-400 text-sm gap-3">
            <div className="w-40 h-1 bg-ink-700 rounded overflow-hidden">
              <div className="h-full w-1/2 bg-alarm animate-pulse" />
            </div>
            Autopilot is writing up the post-mortem from the incident logs…
          </div>
        </div>
      )}

      {stage === "graded" && grade && narrated && extracted && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <ScoreCard grade={grade} elapsedSeconds={frozenElapsed} />
          <PostmortemDoc
            metadata={postmortemMetadata}
            extracted={extracted}
            narrated={narrated}
            onRegenerate={handleRegenerateDoc}
            regenerating={regenerating}
          />
        </div>
      )}
    </main>
  );
}
