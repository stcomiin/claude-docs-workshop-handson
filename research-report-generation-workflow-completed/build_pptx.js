const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Research Team";
pres.title = "OCR Technology Scan \u2014 2026";

// --- Palette: Ocean Gradient with navy/teal ---
const NAVY = "1E2761";
const DEEP_BLUE = "065A82";
const TEAL = "1C7293";
const ICE = "E8F4F8";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F5F7FA";
const MID_GRAY = "64748B";
const DARK = "1E293B";

// --- Helpers ---
function addFooter(slide, num) {
  slide.addText("OCR Technology Scan \u2014 2026", {
    x: 0.5, y: 5.25, w: 5, h: 0.3,
    fontSize: 8, color: MID_GRAY, fontFace: "Calibri"
  });
  slide.addText(String(num), {
    x: 9.0, y: 5.25, w: 0.5, h: 0.3,
    fontSize: 8, color: MID_GRAY, fontFace: "Calibri", align: "right"
  });
}

// ============================================================
// SLIDE 1: Title
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: NAVY };
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 3.8, w: 10, h: 1.85, fill: { color: DEEP_BLUE }
});
s1.addText("OCR Technology Scan", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.2,
  fontSize: 42, fontFace: "Calibri", bold: true, color: WHITE, margin: 0
});
s1.addText("\u2014 2026 \u2014", {
  x: 0.8, y: 2.3, w: 8.4, h: 0.6,
  fontSize: 22, fontFace: "Calibri", color: "7EB8D0", margin: 0
});
s1.addText("Executive Briefing: VLMs \u2022 Cloud APIs \u2022 Open-Source \u2022 IDP Platforms", {
  x: 0.8, y: 4.0, w: 8.4, h: 0.5,
  fontSize: 13, fontFace: "Calibri", color: "B8D4E3", margin: 0
});
s1.addText("April 21, 2026  |  Snapshot date: April 20, 2026", {
  x: 0.8, y: 4.6, w: 8.4, h: 0.4,
  fontSize: 11, fontFace: "Calibri", color: "8AAFC4", margin: 0
});

// ============================================================
// SLIDE 2: Executive Summary
// ============================================================
let s2 = pres.addSlide();
s2.background = { color: LIGHT_GRAY };
addFooter(s2, 2);
s2.addText("Executive Summary", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 28, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.95, w: 1.5, h: 0.04, fill: { color: TEAL }
});
s2.addText([
  { text: "OCR has dissolved into document understanding \u2014 VLMs now emit Markdown/JSON in a single forward pass", options: { bullet: true, breakLine: true } },
  { text: "Small open-weight models (0.9B\u20137B) match or exceed frontier APIs at 100\u00d7 lower cost on OmniDocBench", options: { bullet: true, breakLine: true } },
  { text: "Managed API price floor: $1\u2013$2 per 1,000 pages (Mistral OCR 3, Unstructured Fast)", options: { bullet: true, breakLine: true } },
  { text: "Enterprise IDP reshaped by GenAI re-platforming + consolidation (UiPath+WorkFusion, Sirion+Eigen)", options: { bullet: true, breakLine: true } },
  { text: "Key decision: raw VLM inference vs. managed API vs. self-hosted pipeline vs. full IDP workflow", options: { bullet: true } },
], {
  x: 0.5, y: 1.2, w: 9, h: 4.0,
  fontSize: 14, fontFace: "Calibri", color: DARK, paraSpaceAfter: 10, valign: "top"
});

// ============================================================
// SLIDE 3: Landscape Overview
// ============================================================
let s3 = pres.addSlide();
s3.background = { color: WHITE };
addFooter(s3, 3);
s3.addText("Landscape Overview", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 28, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s3.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.95, w: 1.5, h: 0.04, fill: { color: TEAL }
});

const slices = [
  { title: "Slice 1: VLM-Based OCR", desc: "Frontier & open-weight vision-language models doing end-to-end document parsing", color: DEEP_BLUE },
  { title: "Slice 2: Managed APIs", desc: "Hyperscalers + API specialists \u2014 send bytes, receive structured JSON/Markdown", color: TEAL },
  { title: "Slice 3: Open-Source", desc: "Classic engines (Tesseract, PaddleOCR) + VLM pipelines (MinerU, Docling, olmOCR)", color: "2D8B6F" },
  { title: "Slice 4: Enterprise IDP", desc: "Full workflow platforms with HITL, ERP integration, and vertical specialization", color: "7C4DFF" },
];
slices.forEach((sl, i) => {
  const y = 1.2 + i * 1.05;
  s3.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 0.08, h: 0.85, fill: { color: sl.color }
  });
  s3.addText(sl.title, {
    x: 0.8, y: y, w: 8.7, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: DARK, margin: 0
  });
  s3.addText(sl.desc, {
    x: 0.8, y: y + 0.4, w: 8.7, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: MID_GRAY, margin: 0
  });
});

// ============================================================
// SLIDE 4: Slice 1 \u2014 VLM-Based OCR
// ============================================================
let s4 = pres.addSlide();
s4.background = { color: WHITE };
addFooter(s4, 4);
s4.addText("Slice 1: Foundation-Model / VLM-Based OCR", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s4.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.9, w: 1.5, h: 0.04, fill: { color: DEEP_BLUE }
});
s4.addText([
  { text: "GPT-5: lowest edit distance (0.02) | Claude: lowest hallucination (0.09%) | Gemini 3: cheapest Flash tier", options: { bullet: true, breakLine: true } },
  { text: "Small open-weight models now beat frontier APIs: DeepSeek-OCR-2 (3B) = 91.09, PaddleOCR-VL-1.5 (0.9B) = 94.5%", options: { bullet: true, breakLine: true } },
  { text: "Cost dropped ~80% since 2024 via prompt caching + batch APIs", options: { bullet: true, breakLine: true } },
  { text: "Hallucination mitigation (MARINE, contextual-embedding detectors) is the new frontier", options: { bullet: true, breakLine: true } },
  { text: "OmniDocBench v1.5 is saturated \u2014 Real5-OmniDocBench and ParseBench are successors", options: { bullet: true } },
], {
  x: 0.5, y: 1.1, w: 9, h: 4.0,
  fontSize: 13, fontFace: "Calibri", color: DARK, paraSpaceAfter: 10, valign: "top"
});

// ============================================================
// SLIDE 5: Slice 2 \u2014 Managed APIs
// ============================================================
let s5 = pres.addSlide();
s5.background = { color: WHITE };
addFooter(s5, 5);
s5.addText("Slice 2: Cloud Hyperscaler & Managed OCR APIs", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s5.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.9, w: 1.5, h: 0.04, fill: { color: TEAL }
});
s5.addText([
  { text: "Hyperscalers (Textract, Doc AI, Azure) win on compliance & prebuilt catalog breadth", options: { bullet: true, breakLine: true } },
  { text: "Mistral OCR 3 redefines price: $2/1k pages ($1 Batch) \u2014 vs. Textract $65/1k", options: { bullet: true, breakLine: true } },
  { text: "Reducto: agentic multi-pass, 99.24% clinical SLAs, $108M total funding", options: { bullet: true, breakLine: true } },
  { text: "LlamaParse v2 + Unstructured.io = RAG-optimized with Markdown/JSON + chunk IDs", options: { bullet: true, breakLine: true } },
  { text: "VLMs are now the backbone \u2014 \u201cclassic OCR\u201d relegated to cheap first-pass", options: { bullet: true } },
], {
  x: 0.5, y: 1.1, w: 9, h: 4.0,
  fontSize: 13, fontFace: "Calibri", color: DARK, paraSpaceAfter: 10, valign: "top"
});

// ============================================================
// SLIDE 6: Slice 3 \u2014 Open-Source
// ============================================================
let s6 = pres.addSlide();
s6.background = { color: WHITE };
addFooter(s6, 6);
s6.addText("Slice 3: Open-Source OCR Engines & Libraries", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s6.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.9, w: 1.5, h: 0.04, fill: { color: "2D8B6F" }
});
s6.addText([
  { text: "MinerU 3.1: 95.69 on OmniDocBench v1.6 \u2014 top overall, relicensed Apache (Apr 2026)", options: { bullet: true, breakLine: true } },
  { text: "Docling 2.90 (IBM/MIT): commercial-safest choice with pluggable VLMs and weekly releases", options: { bullet: true, breakLine: true } },
  { text: "olmOCR-2 (7B, Apache-2.0): beats Marker & MinerU on olmOCR-Bench; GRPO RL training", options: { bullet: true, breakLine: true } },
  { text: "Licensing is first-class: MIT/Apache = safe | GPL (Marker/Surya) = Datalab license needed", options: { bullet: true, breakLine: true } },
  { text: "Classic tier (Tesseract, PaddleOCR, RapidOCR) still valuable for CPU/edge/air-gapped", options: { bullet: true } },
], {
  x: 0.5, y: 1.1, w: 9, h: 4.0,
  fontSize: 13, fontFace: "Calibri", color: DARK, paraSpaceAfter: 10, valign: "top"
});

// ============================================================
// SLIDE 7: Slice 4 \u2014 IDP Platforms
// ============================================================
let s7 = pres.addSlide();
s7.background = { color: WHITE };
addFooter(s7, 7);
s7.addText("Slice 4: IDP Platforms & Vertical Specialists", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.9, w: 1.5, h: 0.04, fill: { color: "7C4DFF" }
});
s7.addText([
  { text: "Gartner MQ Leaders (2025): Hyperscience, ABBYY, Tungsten, UiPath, Infrrd", options: { bullet: true, breakLine: true } },
  { text: "Templates replaced by prompt-tunable LLM/VLM extraction across the board", options: { bullet: true, breakLine: true } },
  { text: "Consolidation wave: UiPath+WorkFusion, Sirion+Eigen, SER+Klippa, AlphaSense+Tegus", options: { bullet: true, breakLine: true } },
  { text: "Moat shifting from accuracy (commoditizing) to workflow, HITL, governance, ERP depth", options: { bullet: true, breakLine: true } },
  { text: "Verticals: Veryfi (receipts), Mathpix (STEM), Ocrolus (lending), Jumio (identity/deepfakes)", options: { bullet: true } },
], {
  x: 0.5, y: 1.1, w: 9, h: 4.0,
  fontSize: 13, fontFace: "Calibri", color: DARK, paraSpaceAfter: 10, valign: "top"
});

// ============================================================
// SLIDE 8: Comparison Matrix (table)
// ============================================================
let s8 = pres.addSlide();
s8.background = { color: WHITE };
addFooter(s8, 8);
s8.addText("Comparison Matrix \u2014 Top Tools by Category", {
  x: 0.5, y: 0.2, w: 9, h: 0.55,
  fontSize: 20, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});

const tableHeaders = [
  { text: "Tool", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
  { text: "Type", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
  { text: "Strength", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
  { text: "Cost (~2026)", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
  { text: "License", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
];

const tableRows = [
  ["GPT-5 / GPT-5.4", "Frontier VLM", "Lowest edit distance", "$1.75/$14 per 1M tok", "Proprietary"],
  ["Claude Sonnet 4.6", "Frontier VLM", "Lowest hallucination", "$3/$15 per 1M tok", "Proprietary"],
  ["Gemini 3 Flash", "Frontier VLM", "Cheapest frontier", "Lowest vision API", "Proprietary"],
  ["DeepSeek-OCR-2", "Open VLM (3B)", "SOTA small model", "Free / ~$0.15/1M", "Open weights"],
  ["Mistral OCR 3", "API specialist", "88.9% handwriting", "$2/1k pages", "Proprietary"],
  ["Reducto", "Agentic API", "99.24% clinical SLA", "$0.015/page", "Proprietary"],
  ["MinerU 3.1", "OSS pipeline", "95.69 OmniDocBench", "Free", "Apache"],
  ["Docling 2.90", "OSS pipeline", "MIT, pluggable VLMs", "Free", "MIT"],
  ["Hyperscience", "Enterprise IDP", "Gov-grade ORCA VLM", "$250k\u2013$1M+/yr", "Proprietary"],
  ["Rossum Aurora", "Enterprise IDP", "Template-free T-LLM", "From $1,500/mo", "Proprietary"],
];

const tableData = [tableHeaders];
tableRows.forEach((row, i) => {
  tableData.push(row.map(cell => ({
    text: cell,
    options: i % 2 === 1 ? { fill: { color: ICE } } : {}
  })));
});

s8.addTable(tableData, {
  x: 0.3, y: 0.8, w: 9.4, h: 4.4,
  colW: [1.8, 1.4, 2.1, 1.8, 1.4],
  fontSize: 9,
  fontFace: "Calibri",
  color: DARK,
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: [0.35, 0.37, 0.37, 0.37, 0.37, 0.37, 0.37, 0.37, 0.37, 0.37, 0.37],
  valign: "middle",
});

// ============================================================
// SLIDE 9: Recommendations
// ============================================================
let s9 = pres.addSlide();
s9.background = { color: LIGHT_GRAY };
addFooter(s9, 9);
s9.addText("Recommendations by Use Case", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY, margin: 0
});
s9.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.9, w: 1.5, h: 0.04, fill: { color: TEAL }
});

const recs = [
  ["RAG pipeline (self-hosted)", "Docling (MIT) or MinerU (Apache) + RapidOCR fallback"],
  ["RAG pipeline (pay-per-page)", "Mistral OCR 3 ($2/1k) or LlamaParse v2; Reducto for 99%+ SLA"],
  ["Invoice/PO extraction at scale", "Rossum Aurora or SAP Doc AI; Veryfi for mobile receipts"],
  ["Government / air-gapped", "Hyperscience (ORCA VLM) or ABBYY Vantage 3.0 on-prem"],
  ["Minimize cost, single GPU", "DeepSeek-OCR-2 (3B) or PaddleOCR-VL-1.5 (0.9B)"],
];
recs.forEach((r, i) => {
  const y = 1.1 + i * 0.82;
  s9.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 0.06, h: 0.65, fill: { color: TEAL }
  });
  s9.addText(r[0], {
    x: 0.75, y: y, w: 3.5, h: 0.35,
    fontSize: 12, fontFace: "Calibri", bold: true, color: DARK, margin: 0
  });
  s9.addText(r[1], {
    x: 0.75, y: y + 0.32, w: 8.5, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: MID_GRAY, margin: 0
  });
});

// ============================================================
// SLIDE 10: Sources
// ============================================================
let s10 = pres.addSlide();
s10.background = { color: NAVY };
s10.addText("Sources & Methodology", {
  x: 0.5, y: 0.3, w: 9, h: 0.7,
  fontSize: 28, fontFace: "Calibri", bold: true, color: WHITE, margin: 0
});
s10.addText([
  { text: "Four parallel research streams run on 2026-04-20", options: { bullet: true, breakLine: true } },
  { text: "Benchmarks: OmniDocBench v1.5/v1.6, olmOCR-Bench, CC-OCR, OCRBench v2", options: { bullet: true, breakLine: true } },
  { text: "Pricing: published vendor rate cards; enterprise-quote-only noted where applicable", options: { bullet: true, breakLine: true } },
  { text: "Key sources: CodeSOTA, Gartner MQ (Sept 2025), vendor GitHub repos, arXiv papers", options: { bullet: true, breakLine: true } },
  { text: "Vendor-reported figures should be verified before procurement decisions", options: { bullet: true } },
], {
  x: 0.5, y: 1.1, w: 9, h: 3.5,
  fontSize: 13, fontFace: "Calibri", color: "B8D4E3", paraSpaceAfter: 10, valign: "top"
});
s10.addText("Confidential \u2014 Executive Distribution Only", {
  x: 0.5, y: 5.0, w: 9, h: 0.4,
  fontSize: 9, fontFace: "Calibri", color: "7EB8D0", align: "center"
});

// --- Write ---
const outPath = path.join(__dirname, "ocr_tech_scan.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log(`Wrote ${outPath}`);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
