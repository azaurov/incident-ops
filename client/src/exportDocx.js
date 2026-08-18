import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

export async function exportPostmortemDocx({ metadata, extracted, narrated }) {
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(`${metadata.name || "Untitled Incident"} [${metadata.severity || "?"}]`)],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${metadata.date || "—"}    Reporter: ${metadata.reporter || "—"}`, italics: true }),
      ],
    }),
    new Paragraph({ text: "" }),

    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Summary" }),
    new Paragraph({ text: narrated.summary || "" }),

    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Timeline" }),
    ...(extracted.timeline || []).map(
      (row) =>
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: `${row.time}  `, bold: true }),
            new TextRun(row.event),
          ],
        })
    ),

    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Root Cause" }),
    new Paragraph({ text: narrated.rca_narrative || extracted.root_cause || "" }),

    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Contributing Factors" }),
    ...(extracted.contributing_factors || []).map(
      (f) => new Paragraph({ bullet: { level: 0 }, text: f })
    ),

    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Action Items" }),
    ...(narrated.action_items || []).map(
      (item) =>
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun(`${item.text} — `),
            new TextRun({ text: item.owner, bold: true }),
            new TextRun(` (${item.priority})`),
          ],
        })
    ),
  ];

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const fileName = `${(metadata.name || "postmortem").replace(/\s+/g, "_")}.docx`;
  saveAs(blob, fileName);
}
