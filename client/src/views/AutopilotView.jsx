import { useState } from "react";
import MetadataForm from "../components/MetadataForm";
import InputPanel from "../components/InputPanel";
import PostmortemDoc from "../components/PostmortemDoc";

const todayISO = () => new Date().toISOString().slice(0, 10);

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

export default function AutopilotView() {
  const [metadata, setMetadata] = useState({
    name: "",
    date: todayISO(),
    severity: "P1",
    reporter: "",
  });
  const [mode, setMode] = useState("slack");
  const [rawText, setRawText] = useState("");

  const [extracted, setExtracted] = useState(null);
  const [narrated, setNarrated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    setExtracted(null);
    setNarrated(null);
    try {
      const ext = await postJson("/api/extract", { metadata, mode, rawText });
      setExtracted(ext);
      const nar = await postJson("/api/narrate", { metadata, extracted: ext });
      setNarrated(nar);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!extracted) return;
    setRegenerating(true);
    setError(null);
    try {
      const nar = await postJson("/api/narrate", { metadata, extracted });
      setNarrated(nar);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="bg-ink-900 border border-ink-700 rounded-xl p-4">
          <MetadataForm metadata={metadata} onChange={setMetadata} />
        </div>
        <div className="bg-ink-900 border border-ink-700 rounded-xl p-4">
          <InputPanel
            mode={mode}
            onModeChange={setMode}
            rawText={rawText}
            onTextChange={setRawText}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>
        {error && (
          <div className="bg-alarm-dim/40 border border-alarm/40 text-alarm rounded-lg px-3 py-2 text-sm font-mono">
            {error}
          </div>
        )}
      </div>

      <div>
        {!narrated && !loading && (
          <div className="h-full min-h-72 flex items-center justify-center border border-dashed border-ink-700 rounded-xl text-ink-400 text-sm">
            Your post-mortem will render here.
          </div>
        )}
        {loading && (
          <div className="h-full min-h-72 flex flex-col items-center justify-center border border-ink-700 rounded-xl text-ink-400 text-sm gap-3">
            <div className="w-40 h-1 bg-ink-700 rounded overflow-hidden">
              <div className="h-full w-1/2 bg-alarm animate-pulse" />
            </div>
            Drafting post-mortem…
          </div>
        )}
        {narrated && extracted && (
          <PostmortemDoc
            metadata={metadata}
            extracted={extracted}
            narrated={narrated}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        )}
      </div>
    </main>
  );
}
