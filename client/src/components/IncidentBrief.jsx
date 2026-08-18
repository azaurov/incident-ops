function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function IncidentBrief({ brief, elapsedSeconds, resolved }) {
  const urgent = !resolved && elapsedSeconds > 300;
  return (
    <div className="flex items-center justify-between bg-ink-900 border border-ink-700 rounded-xl px-5 py-4">
      <div>
        <div
          className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest mb-1 ${
            resolved ? "text-ok" : "text-alarm"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${resolved ? "bg-ok" : "bg-alarm animate-pulse"}`} />
          {resolved ? "Incident Resolved" : "Incident Active"}
        </div>
        <div className="font-display font-semibold text-ink-200">{brief.system}</div>
        <div className="text-sm text-ink-400 mt-0.5">{brief.impact}</div>
        <div className="text-xs text-ink-400 mt-1 font-mono">Detected {brief.detected_time}</div>
      </div>
      <div
        className={`font-mono text-2xl font-semibold tabular-nums ${
          urgent ? "text-alarm" : "text-ink-200"
        }`}
      >
        {formatElapsed(elapsedSeconds)}
      </div>
    </div>
  );
}
