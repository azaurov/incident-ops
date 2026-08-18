import { useState } from "react";
import AutopilotView from "./views/AutopilotView";
import SimulatorView from "./views/SimulatorView";

const TABS = [
  { key: "simulate", label: "Simulate" },
  { key: "autopilot", label: "Autopilot" },
];

export default function App() {
  const [tab, setTab] = useState("simulate");

  return (
    <div className="min-h-screen bg-ink-950 text-ink-200">
      <header className="border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight text-ink-200">Incident Ops</h1>
          <p className="text-sm text-ink-400">Simulate the incident. Autopilot writes it up.</p>
        </div>
        <div className="flex gap-1 bg-ink-900 border border-ink-700 rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-md font-display transition-colors ${
                tab === t.key ? "bg-ink-600 text-ink-200" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === "simulate" ? <SimulatorView /> : <AutopilotView />}
    </div>
  );
}
