function ScoreBar({ label, value }) {
  const color = value >= 70 ? "bg-ok" : value >= 40 ? "bg-warn" : "bg-alarm";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink-400">{label}</span>
        <span className="font-mono text-ink-200">{value}%</span>
      </div>
      <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ScoreCard({ grade, elapsedSeconds }) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink-200">Score</h2>
        <span className="font-mono text-sm text-ink-400">Resolved in {mins}:{secs}</span>
      </div>
      <ScoreBar label="Severity Accuracy" value={grade.severity_accuracy} />
      <ScoreBar label="RCA Match" value={grade.rca_match_pct} />
      <ScoreBar label="Decision Quality" value={grade.decision_quality} />
      <p className="text-sm text-ink-200 leading-relaxed border-t border-ink-700 pt-3">{grade.feedback}</p>
    </div>
  );
}
