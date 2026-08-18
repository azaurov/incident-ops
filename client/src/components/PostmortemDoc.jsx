import { useState } from "react";
import { toMarkdown } from "../postmortemFormat";
import { exportPostmortemDocx } from "../exportDocx";

const SEVERITY_STYLE = {
  P1: "bg-alarm text-ink-950",
  P2: "bg-warn text-ink-950",
  P3: "bg-ok text-ink-950",
};

function RegenerateButton({ onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="text-xs uppercase tracking-wide text-paper-muted hover:text-paper-ink border border-paper-line rounded px-2 py-1 disabled:opacity-40 transition"
    >
      {busy ? "…" : "↻ Regenerate"}
    </button>
  );
}

export default function PostmortemDoc({ metadata, extracted, narrated, onRegenerate, regenerating }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyMarkdown = async () => {
    const markdown = toMarkdown({ metadata, extracted, narrated });
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Some browser/embed contexts deny direct clipboard writes — fall back
      // to a manual copy via a temporary selectable textarea.
      const el = document.createElement("textarea");
      el.value = markdown;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 1500);
      }
    }
  };

  return (
    <div className="animate-print-in bg-paper text-paper-ink rounded-sm shadow-2xl shadow-black/40 p-8 font-doc">
      <div className="flex items-start justify-between border-b border-paper-line pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-paper-muted font-mono mb-1">
            Post-Mortem Report
          </div>
          <h1 className="text-2xl font-semibold leading-tight">{metadata.name || "Untitled Incident"}</h1>
          <div className="text-sm text-paper-muted font-mono mt-1">
            {metadata.date || "—"} · Owner: {metadata.reporter || "—"}
          </div>
        </div>
        <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded ${SEVERITY_STYLE[metadata.severity] || SEVERITY_STYLE.P2}`}>
          {metadata.severity || "P2"}
        </span>
      </div>

      <div className="flex justify-end gap-2 mb-4 font-display">
        <button
          onClick={copyMarkdown}
          className="text-xs uppercase tracking-wide text-paper-muted hover:text-paper-ink border border-paper-line rounded px-2 py-1 transition"
        >
          {copied ? "Copied ✓" : copyFailed ? "Copy failed" : "Copy Markdown"}
        </button>
        <button
          onClick={() => exportPostmortemDocx({ metadata, extracted, narrated })}
          className="text-xs uppercase tracking-wide text-paper-muted hover:text-paper-ink border border-paper-line rounded px-2 py-1 transition"
        >
          Export DOCX
        </button>
      </div>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2 font-display">
          <h2 className="text-xs uppercase tracking-widest text-paper-muted">Summary</h2>
          <RegenerateButton onClick={() => onRegenerate()} busy={regenerating} />
        </div>
        <p className="leading-relaxed">{narrated.summary}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-widest text-paper-muted mb-2 font-display">Timeline</h2>
        <table className="w-full text-sm font-mono">
          <tbody>
            {(extracted.timeline || []).map((row, i) => (
              <tr key={i} className="border-t border-paper-line/60 first:border-t-0">
                <td className="py-1.5 pr-4 text-paper-muted whitespace-nowrap align-top">{row.time}</td>
                <td className="py-1.5 font-doc">{row.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2 font-display">
          <h2 className="text-xs uppercase tracking-widest text-paper-muted">Root Cause</h2>
          <RegenerateButton onClick={() => onRegenerate()} busy={regenerating} />
        </div>
        <p className="leading-relaxed">{narrated.rca_narrative || extracted.root_cause}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-widest text-paper-muted mb-2 font-display">Contributing Factors</h2>
        <ul className="list-disc pl-5 space-y-1">
          {(extracted.contributing_factors || []).map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2 font-display">
          <h2 className="text-xs uppercase tracking-widest text-paper-muted">Action Items</h2>
          <RegenerateButton onClick={() => onRegenerate()} busy={regenerating} />
        </div>
        <ul className="space-y-1.5">
          {(narrated.action_items || []).map((item, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <input type="checkbox" className="mt-1" />
              <span className="flex-1">{item.text}</span>
              <span className="font-mono text-xs text-paper-muted whitespace-nowrap">
                {item.owner} · {item.priority}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
