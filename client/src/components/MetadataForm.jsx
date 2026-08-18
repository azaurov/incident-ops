const SEVERITIES = ["P1", "P2", "P3"];

export default function MetadataForm({ metadata, onChange }) {
  const set = (key) => (e) => onChange({ ...metadata, [key]: e.target.value });

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="col-span-2 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Incident</span>
        <input
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 placeholder:text-ink-400 focus:outline-none focus:border-alarm/60"
          placeholder="CRD Trade Routing Failure"
          value={metadata.name}
          onChange={set("name")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Date</span>
        <input
          type="date"
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 focus:outline-none focus:border-alarm/60"
          value={metadata.date}
          onChange={set("date")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Severity</span>
        <select
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 focus:outline-none focus:border-alarm/60"
          value={metadata.severity}
          onChange={set("severity")}
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="col-span-2 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-400">Reporter</span>
        <input
          className="bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-200 placeholder:text-ink-400 focus:outline-none focus:border-alarm/60"
          placeholder="Alex Z."
          value={metadata.reporter}
          onChange={set("reporter")}
        />
      </label>
    </div>
  );
}
