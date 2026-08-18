const MODES = [
  { key: "slack", label: "Slack" },
  { key: "logs", label: "Logs" },
  { key: "notes", label: "Notes" },
];

const PLACEHOLDERS = {
  slack: "9:14 AM  @priya: FIX session just dropped on OMS-01\n9:17 AM  @priya: pagerduty fired\n9:22 AM  @alex: on it, acking now\n9:41 AM  @alex: found it — cert expired last night...",
  logs: "09:14:02 ERROR FIX session dropped on primary OMS node\n09:14:05 WARN  Reconnect attempt 1 failed\n09:22:11 INFO  On-call engineer acknowledged page\n09:41:30 INFO  Root cause identified: TLS certificate expired",
  notes: "Noticed trades stopped routing around 9:15. Paged on-call. Turned out to be an expired cert on the FIX gateway, nobody had a monitor on renewal date. Fixed by 9:58.",
};

export default function InputPanel({ mode, onModeChange, rawText, onTextChange, onGenerate, loading }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 bg-ink-800 rounded-lg p-1 w-fit">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              mode === m.key
                ? "bg-ink-600 text-ink-200"
                : "text-ink-400 hover:text-ink-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        className="bg-ink-800 border border-ink-600 rounded-lg p-3 text-sm text-ink-200 placeholder:text-ink-400 font-mono min-h-56 resize-y focus:outline-none focus:border-alarm/60"
        placeholder={PLACEHOLDERS[mode]}
        value={rawText}
        onChange={(e) => onTextChange(e.target.value)}
      />

      <button
        onClick={onGenerate}
        disabled={loading || !rawText.trim()}
        className="self-start px-5 py-2.5 rounded-lg bg-alarm text-ink-950 font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {loading ? "Generating…" : "⚡ Generate Post-Mortem"}
      </button>
    </div>
  );
}
