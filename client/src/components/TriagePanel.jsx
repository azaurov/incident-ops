const SEVERITIES = ["P1", "P2", "P3"];

export default function TriagePanel({ triage, onChange, onSubmit, submitting }) {
  const set = (key) => (e) => onChange({ ...triage, [key]: e.target.value });
  const canSubmit = triage.rootCauseHypothesis.trim() && triage.affectedSystems.trim();

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink-200">Your Triage</h2>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Severity</span>
        <select
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 focus:outline-none focus:border-alarm/60"
          value={triage.severity}
          onChange={set("severity")}
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Affected systems</span>
        <input
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 placeholder:text-ink-400 focus:outline-none focus:border-alarm/60"
          placeholder="e.g. FIX gateway, order routing"
          value={triage.affectedSystems}
          onChange={set("affectedSystems")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Root cause hypothesis</span>
        <textarea
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 placeholder:text-ink-400 min-h-20 resize-y focus:outline-none focus:border-alarm/60"
          placeholder="What do you think happened?"
          value={triage.rootCauseHypothesis}
          onChange={set("rootCauseHypothesis")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Escalation decision</span>
        <input
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 placeholder:text-ink-400 focus:outline-none focus:border-alarm/60"
          placeholder="Who are you escalating to, if anyone?"
          value={triage.escalation}
          onChange={set("escalation")}
        />
      </label>

      <button
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="mt-1 px-5 py-2.5 rounded-lg bg-alarm text-ink-950 font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {submitting ? "Grading…" : "Declare Incident Resolved"}
      </button>
    </div>
  );
}
