export function toMarkdown({ metadata, extracted, narrated }) {
  const lines = [];
  lines.push(`# ${metadata.name || "Untitled Incident"} [${metadata.severity || "?"}]`);
  lines.push(`Date: ${metadata.date || "—"} | Reporter: ${metadata.reporter || "—"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(narrated.summary || "");
  lines.push("");
  lines.push("## Timeline");
  for (const row of extracted.timeline || []) {
    lines.push(`- **${row.time}** — ${row.event}`);
  }
  lines.push("");
  lines.push("## Root Cause");
  lines.push(narrated.rca_narrative || extracted.root_cause || "");
  lines.push("");
  lines.push("## Contributing Factors");
  for (const f of extracted.contributing_factors || []) {
    lines.push(`- ${f}`);
  }
  lines.push("");
  lines.push("## Action Items");
  for (const item of narrated.action_items || []) {
    lines.push(`- [ ] ${item.text} — ${item.owner} (${item.priority})`);
  }
  return lines.join("\n");
}
