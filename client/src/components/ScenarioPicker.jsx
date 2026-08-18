const DOMAINS = [
  { key: "financial-ops", label: "Financial Ops", desc: "OMS, FIX gateways, trade routing" },
  { key: "job-scheduling", label: "Job Scheduling", desc: "Cron, ETL, workflow orchestration" },
  { key: "api-gateway", label: "API Gateway", desc: "Edge, load balancers, microservices" },
  { key: "db-replication", label: "DB Replication", desc: "Primary/replica clusters, CDC" },
];

export default function ScenarioPicker({ onPick, loading, loadingDomain }) {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="text-center mb-10">
        <div className="font-mono text-xs uppercase tracking-widest text-alarm mb-2">Incident Simulator</div>
        <h1 className="font-display text-3xl font-bold text-ink-200">Pick your battlefield</h1>
        <p className="text-ink-400 mt-2">An incident is about to land. You'll have logs, a timer, and one shot at triage.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOMAINS.map((d) => (
          <button
            key={d.key}
            onClick={() => onPick(d.key)}
            disabled={loading}
            className="text-left bg-ink-900 border border-ink-700 rounded-xl p-5 hover:border-alarm/60 hover:bg-ink-800 transition disabled:opacity-40 disabled:cursor-wait"
          >
            <div className="font-display font-semibold text-ink-200">{d.label}</div>
            <div className="text-sm text-ink-400 mt-1">{d.desc}</div>
            {loading && loadingDomain === d.key && (
              <div className="text-xs font-mono text-alarm mt-3">spinning up incident…</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
