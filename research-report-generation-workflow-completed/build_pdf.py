"""Build ocr_tech_scan.pdf from content — executive distribution style."""

import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, BaseDocTemplate, Frame, PageTemplate,
    Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether,
    NextPageTemplate, FrameBreak
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib import colors

# --- Colors ---
NAVY = HexColor("#1F3864")
BLUE = HexColor("#2E74B5")
LIGHT_BLUE = HexColor("#D6E4F0")
LIGHTER_BLUE = HexColor("#EBF2F9")
GRAY = HexColor("#595959")
LIGHT_GRAY = HexColor("#F2F2F2")
DARK_GRAY = HexColor("#333333")

OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ocr_tech_scan.pdf")


# --- Page templates with header/footer ---
def header_footer(canvas, doc):
    canvas.saveState()
    w, h = doc.pagesize
    # Header
    canvas.setFont("Helvetica-Oblique", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(doc.leftMargin, h - 0.4 * inch, "OCR Technology Scan \u2014 2026")
    canvas.drawRightString(w - doc.rightMargin, h - 0.4 * inch, "Executive Summary Report")
    canvas.setStrokeColor(HexColor("#CCCCCC"))
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, h - 0.5 * inch, w - doc.rightMargin, h - 0.5 * inch)
    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.line(doc.leftMargin, 0.55 * inch, w - doc.rightMargin, 0.55 * inch)
    canvas.drawCentredString(w / 2, 0.35 * inch, f"Page {doc.page}")
    canvas.drawRightString(w - doc.rightMargin, 0.35 * inch, "Confidential")
    canvas.restoreState()


def title_page(canvas, doc):
    """Title page — no header/footer."""
    pass


def landscape_header_footer(canvas, doc):
    canvas.saveState()
    w, h = doc.pagesize
    canvas.setFont("Helvetica-Oblique", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(doc.leftMargin, h - 0.4 * inch, "OCR Technology Scan \u2014 2026")
    canvas.drawRightString(w - doc.rightMargin, h - 0.4 * inch, "Comparison Matrix")
    canvas.setStrokeColor(HexColor("#CCCCCC"))
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, h - 0.5 * inch, w - doc.rightMargin, h - 0.5 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.line(doc.leftMargin, 0.55 * inch, w - doc.rightMargin, 0.55 * inch)
    canvas.drawCentredString(w / 2, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


# --- Styles ---
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    "ReportTitle", parent=styles["Title"],
    fontName="Helvetica-Bold", fontSize=36, textColor=NAVY,
    alignment=TA_CENTER, spaceAfter=12
))
styles.add(ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontName="Helvetica-Oblique", fontSize=14, textColor=GRAY,
    alignment=TA_CENTER, spaceAfter=6
))
styles.add(ParagraphStyle(
    "H1", parent=styles["Heading1"],
    fontName="Helvetica-Bold", fontSize=18, textColor=NAVY,
    spaceBefore=24, spaceAfter=10, keepWithNext=True
))
styles.add(ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontName="Helvetica-Bold", fontSize=13, textColor=BLUE,
    spaceBefore=16, spaceAfter=8, keepWithNext=True
))
styles.add(ParagraphStyle(
    "H3", parent=styles["Heading3"],
    fontName="Helvetica-Bold", fontSize=11, textColor=BLUE,
    spaceBefore=12, spaceAfter=6, keepWithNext=True
))
styles.add(ParagraphStyle(
    "Body", parent=styles["Normal"],
    fontName="Helvetica", fontSize=9.5, textColor=DARK_GRAY,
    leading=13, spaceAfter=8, alignment=TA_JUSTIFY
))
styles.add(ParagraphStyle(
    "BulletItem", parent=styles["Normal"],
    fontName="Helvetica", fontSize=9.5, textColor=DARK_GRAY,
    leading=13, spaceAfter=5, leftIndent=18, bulletIndent=6,
    bulletFontName="Helvetica", bulletFontSize=9.5
))
styles.add(ParagraphStyle(
    "TableCell", parent=styles["Normal"],
    fontName="Helvetica", fontSize=7, leading=9, textColor=DARK_GRAY
))
styles.add(ParagraphStyle(
    "TableHeader", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=7, leading=9, textColor=white
))
styles.add(ParagraphStyle(
    "SourceBullet", parent=styles["Normal"],
    fontName="Helvetica", fontSize=8, textColor=DARK_GRAY,
    leading=11, spaceAfter=3, leftIndent=18, bulletIndent=6
))


def body(text):
    return Paragraph(text, styles["Body"])


def bullet(text):
    return Paragraph(f"\u2022 {text}", styles["BulletItem"])


def h1(text):
    return Paragraph(text, styles["H1"])


def h2(text):
    return Paragraph(text, styles["H2"])


def h3(text):
    return Paragraph(text, styles["H3"])


def source_bullet(text):
    return Paragraph(f"\u2022 {text}", styles["SourceBullet"])


# --- Comparison Matrix ---
MATRIX_HEADERS = ["Tool", "Type", "Deployment", "Primary Strength", "Notable Weakness", "Cost (~2026)", "License / Lock-in", "Best For"]

MATRIX_DATA = [
    ["GPT-5 / GPT-5.4", "Frontier VLM", "API (OpenAI, Azure)", "Lowest edit distance on OmniDocBench among frontier APIs", "Costly vs open-weight; no native bboxes", "~$1.75 / $14 per 1M tokens", "Proprietary, vendor lock-in", "Hardest documents where cost is secondary"],
    ["Claude Sonnet 4.6 / Opus 4.7", "Frontier VLM", "API (Anthropic, Bedrock, Vertex)", "Lowest hallucination rate (~0.09%); 1M-token context; high-res vision", "Higher image-token cost on long PDFs", "Sonnet: $3/$15 per 1M tokens", "Proprietary", "Agentic doc workflows; compliance-sensitive"],
    ["Gemini 3 Pro / 2.5 Flash", "Frontier VLM", "API (Google, Vertex)", "Top OmniDocBench score; cheapest Flash tier", "Grounding/bbox via prompting only", "Flash among cheapest vision APIs", "Proprietary", "Long-document, high-volume, price-sensitive"],
    ["Qwen3-VL / Qwen3.5-VL", "Open-weight VLM", "Self-host / hosted API", "Open-weight SOTA; 32 languages; strong Asian scripts", "235B variant heavy to self-host", "Free; hosted ~$0.10\u2013$0.30/1M tokens", "Apache-2.0 / Qwen", "Multilingual self-hosted document AI"],
    ["DeepSeek-OCR-2 (3B)", "Doc-specialized VLM", "Self-host / hosted", "SOTA small-model on OmniDocBench v1.5 (91.09)", "Narrower general-VLM reasoning", "Free; hosted ~$0.15/1M tokens", "Open weights", "Dense layout / optical-compression"],
    ["PaddleOCR-VL-1.5 (0.9B)", "Doc-specialized VLM", "Self-host", "94.5% OmniDocBench v1.5; 109 languages; NaViT", "Paddle ecosystem friction", "Free", "Apache-2.0", "Multilingual, self-hosted, GPU-available"],
    ["AWS Textract", "Managed API", "Managed (AWS)", "Mature Forms/Tables/Queries; FedRAMP/HIPAA", "Quality lags VLM-backed APIs", "$1.50\u2013$65 / 1k pages", "Proprietary; AWS lock-in", "Regulated US enterprise on AWS"],
    ["Google Document AI", "Managed API", "Managed (GCP)", "Gemini 3-backed Layout Parser; rich processor catalog", "Processor sprawl; narrower data-residency", "Layout $10/1k; Form $30/1k", "Proprietary; GCP lock-in", "Enterprises on Vertex AI / BigQuery"],
    ["Azure AI Doc Intelligence", "Managed API", "Managed (Azure)", "Prebuilt tax/mortgage/ID; Custom Generative Extraction", "Dense SKU matrix", "Read $1.50; Prebuilt $10; Custom $30/1k", "Proprietary; Azure lock-in", "Microsoft/Azure shops; regulated"],
    ["Mistral OCR 3", "API specialist", "Managed (multi-cloud)", "88.9% handwriting, 96.6% tables; EU-hosted", "Vendor-reported benchmarks", "$2/1k pages ($1 Batch)", "Proprietary, cross-cloud", "High-accuracy at low cost; EU residency"],
    ["Reducto", "API (agentic)", "Managed", "Hybrid multi-pass OCR + VLM; 99.24% clinical SLAs", "Slower than single-pass", "$0.015/page (~$15/1k)", "Proprietary", "Enterprise accuracy-critical"],
    ["LlamaParse v2", "API specialist", "Managed", "Tiered modes; LlamaIndex-native; pinned versions", "Credit-based pricing complexity", "Fast ~$1.25/1k; Agentic Plus ~$12+/1k", "Proprietary", "RAG/agent pipelines on LlamaIndex"],
    ["Unstructured.io (API)", "API specialist", "Managed", "25+ file types; element-tree output; RAG-first", "OCR quality = underlying engine", "Fast $1/1k; Hi-Res $10/1k", "Proprietary", "RAG ingestion, heterogeneous corpora"],
    ["Tesseract 5.5.2", "OSS engine", "Self-host (CPU)", "100+ languages; runs anywhere; reference baseline", "Weak on layout/tables/handwriting", "Free", "Apache-2.0", "Clean printed text, offline/edge"],
    ["PaddleOCR 3.4.1", "OSS engine + VLM", "Self-host", "Most active classic OCR; PP-OCRv5 + VL unified", "Paddle-framework-leaning", "Free", "Apache-2.0", "Self-hosted multilingual OCR"],
    ["Surya + Marker", "OSS VLM pipeline", "Self-host (GPU)", "PDF\u2192Markdown; tables/math/multi-column", "GPL-3.0 requires Datalab license", "Free (OSS) / paid (commercial)", "GPL-3.0", "Academic / technical PDF, non-commercial"],
    ["olmOCR-2 (7B)", "OSS VLM (Ai2)", "Self-host (GPU)", "Qwen2.5-VL fine-tune; 82.4 olmOCR-Bench", "16\u201320 GB VRAM; English-leaning", "Free", "Apache-2.0", "LLM pretraining corpus, scale OCR"],
    ["MinerU 3.1", "OSS VLM pipeline", "Self-host (GPU)", "95.69 on OmniDocBench v1.6; native DOCX", "GPU-first; smaller English community", "Free", "Apache-based (Apr 2026)", "Commercial self-hosted, top-quality"],
    ["Docling 2.90", "OSS pipeline (IBM)", "Self-host (CPU+GPU)", "MIT-licensed; pluggable VLMs; LF governance", "Slightly below MinerU on benchmarks", "Free", "MIT", "Commercial-safe enterprise RAG"],
    ["Rossum Aurora", "Enterprise IDP", "SaaS / private cloud", "Transactional T-LLM; template-free; ERP connectors", "Narrow to AP/PO/orders", "From ~$1,500/mo", "Proprietary", "AP automation, transactional docs"],
    ["ABBYY Vantage 3.0", "Enterprise IDP", "SaaS / on-prem", "200+ skills; deep compliance; 35+ yr heritage", "Heavy deployment; migration friction", "Enterprise quote, mid-six-figure", "Proprietary", "Regulated enterprises, on-prem"],
    ["Hyperscience Hypercell", "Enterprise IDP", "SaaS / on-prem / air-gapped", "ORCA VLM; blocks-and-flows; gov-grade", "Premium pricing; long implementation", "$250k\u2013$1M+ annual", "Proprietary", "Government, FSI, air-gapped HITL"],
    ["UiPath Document Understanding", "Enterprise IDP", "SaaS", "Tightest RPA binding; Autopilot for IXP", "AI Unit pricing can escalate", "1\u20132 AI Units/page", "Proprietary", "Shops already on UiPath RPA"],
    ["Tungsten TotalAgility", "Enterprise IDP", "SaaS / on-prem", "Kofax+Ephesoft rollup; wide ERP/RPA footprint", "SKU confusion post-consolidation", "$100k+ annual floor", "Proprietary", "Large bank/gov, existing Kofax base"],
    ["Nanonets", "Mid-market IDP", "SaaS", "Low-code workflow builder; fast TTV", "Depth gaps for regulated enterprise", "$0\u2013$999/mo", "Proprietary", "SMB/mid-market, rapid deployment"],
    ["Docsumo", "Mid-market IDP", "SaaS", "Lending/insurance focus; transparent pricing", "Lighter integrations", "Free (100 credits); Growth $299/mo", "Proprietary", "Mid-market FS/insurance"],
    ["Veryfi", "Vertical (receipts)", "SaaS / Mobile SDK", "Sub-5s receipt extraction; mobile SDK", "Narrow to receipts/invoices", "Free tier; Enterprise from $500/mo", "Proprietary", "Expense mgmt, field service"],
    ["Mathpix", "Vertical (STEM)", "Managed API", "Industry-standard math/chem OCR; LaTeX", "Narrow to scientific docs", "Per-snip / per-page quotes", "Proprietary", "Publishers, EdTech, STEM data"],
    ["Ocrolus", "Vertical (lending)", "SaaS", "Bank statements, tax returns, fraud detection", "US lending-specific", "Enterprise quote", "Proprietary", "Consumer/SMB lending"],
    ["MyScript", "Vertical (ink)", "SDK / on-device", "Stroke-based handwriting; 70+ languages", "Not image OCR \u2014 digital ink only", "OEM licensing", "Proprietary", "Note-taking apps, OEM"],
]


def build_matrix_table():
    col_widths = [1.2*inch, 0.85*inch, 1.05*inch, 1.7*inch, 1.4*inch, 1.15*inch, 1.05*inch, 1.2*inch]
    header_row = [Paragraph(h, styles["TableHeader"]) for h in MATRIX_HEADERS]
    data = [header_row]
    for row in MATRIX_DATA:
        data.append([Paragraph(cell, styles["TableCell"]) for cell in row])

    t = Table(data, colWidths=col_widths, repeatRows=1, splitInRow=False)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#CCCCCC")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), LIGHTER_BLUE))
    t.setStyle(TableStyle(style_cmds))
    return t


# --- Build Document ---
def build_pdf():
    # Page sizes
    pw, ph = letter
    lw, lh = landscape(letter)

    # Portrait frame
    portrait_frame = Frame(
        0.75 * inch, 0.75 * inch,
        pw - 1.5 * inch, ph - 1.25 * inch,
        id="portrait"
    )
    # Landscape frame
    landscape_frame = Frame(
        0.6 * inch, 0.75 * inch,
        lw - 1.2 * inch, lh - 1.25 * inch,
        id="landscape"
    )
    # Title frame (more top margin)
    title_frame = Frame(
        1.0 * inch, 0.75 * inch,
        pw - 2.0 * inch, ph - 1.5 * inch,
        id="title"
    )

    doc = BaseDocTemplate(
        OUT_PATH,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.75 * inch,
        title="OCR Technology Scan \u2014 2026",
        author="Research Team",
    )

    doc.addPageTemplates([
        PageTemplate(id="title_page", frames=[title_frame], onPage=title_page, pagesize=letter),
        PageTemplate(id="portrait", frames=[portrait_frame], onPage=header_footer, pagesize=letter),
        PageTemplate(id="landscape", frames=[landscape_frame], onPage=landscape_header_footer, pagesize=landscape(letter)),
    ])

    story = []

    # --- Title Page ---
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph("OCR Technology Scan", styles["ReportTitle"]))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("\u2014 2026 \u2014", ParagraphStyle("year", parent=styles["Subtitle"], fontSize=20, textColor=NAVY)))
    story.append(Spacer(1, 0.6 * inch))
    story.append(HRFlowable(width="60%", thickness=1, color=BLUE, spaceAfter=20))
    story.append(Paragraph("Landscape Review: VLMs \u2022 Managed APIs \u2022 Open-Source Engines \u2022 IDP Platforms", styles["Subtitle"]))
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("April 21, 2026", ParagraphStyle("date", parent=styles["Subtitle"], fontSize=16, fontName="Helvetica-Bold", textColor=DARK_GRAY)))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("Prepared from four parallel research streams<br/>Snapshot date: April 20, 2026", styles["Subtitle"]))
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph("CONFIDENTIAL \u2014 Executive Distribution Only", ParagraphStyle("conf", parent=styles["Subtitle"], fontSize=9, textColor=GRAY)))

    # Switch to portrait with headers
    story.append(NextPageTemplate("portrait"))
    story.append(PageBreak())

    # --- Executive Summary ---
    story.append(h1("Executive Summary"))
    story.append(body("OCR as a distinct category has effectively dissolved into document understanding. In the last 12\u201318 months, vision-language models \u2014 both frontier (GPT-5, Claude 4.x, Gemini 3) and small document-specialized open-weight models (PaddleOCR-VL-1.5 at 0.9B, DeepSeek-OCR-2 at 3B, MinerU2.5 at 1.2B, olmOCR-2 at 7B) \u2014 have collapsed the classic layout-detect \u2192 recognize \u2192 reconstruct pipeline into a single forward pass that emits Markdown or JSON directly."))
    story.append(body("On public benchmarks like OmniDocBench v1.5/1.6, small open-weight document VLMs now match or exceed frontier APIs at 100\u00d7 lower per-page cost. Pricing has compressed brutally on the managed side (Mistral OCR 3 at $1\u2013$2 per 1,000 pages vs. $30\u2013$65 for the hyperscalers\u2019 form-parsing tiers), while the enterprise IDP category is being reshaped simultaneously by GenAI-first re-platformings and a consolidation wave."))
    story.append(body("For anyone choosing OCR tooling today, the right question is no longer \u201cwhich OCR engine?\u201d but \u201cwhere on the stack do I want to sit?\u201d \u2014 raw VLM in your own inference, managed API with structured JSON, self-hosted document pipeline, or full IDP workflow platform. The cost, accuracy, and control trade-offs between those four choices are now larger than the trade-offs inside any one of them."))

    # --- Landscape Overview ---
    story.append(h1("Landscape Overview"))

    story.append(h2("Slice 1 \u2014 Foundation-Model / VLM-Based OCR"))
    story.append(body("Frontier multimodal LLMs from OpenAI, Anthropic, Google, xAI, and Cohere can read documents end-to-end in a single pass; open-weight alternatives (Qwen3-VL, InternVL3, DeepSeek-OCR-2, MiniCPM-V 4.5, Llama 3.2 Vision, Molmo, Pixtral) have closed \u2014 and in some cases crossed \u2014 the gap on pure document benchmarks. The paradigm shift is that small, document-specialized VLMs post-trained on OCR/layout/table/formula objectives now beat generalist frontier models on OmniDocBench while running on a single consumer GPU. Hallucination remains the biggest reliability concern; Claude leads on hallucination rate (~0.09% on CC-OCR), GPT-5 on raw text edit distance, and Gemini 3 on price/performance. Cost curves have dropped roughly 80% since 2024."))

    story.append(h2("Slice 2 \u2014 Cloud Hyperscaler & Managed OCR APIs"))
    story.append(body("The \u201csend bytes, receive structured text\u201d category splits into two clear tiers. Hyperscalers (AWS Textract, Google Document AI, Azure AI Document Intelligence) compete on compliance, regional coverage, and prebuilt catalog breadth. API-first specialists (Mistral OCR 3, Reducto, LlamaParse, Unstructured.io, Upstage, Jina Reader) compete on price, Markdown/JSON fidelity, and raw accuracy. Mistral OCR 3 at $1\u20132 per 1,000 pages and Unstructured Fast at $1 per 1,000 pages make Textract AnalyzeDocument ($65) look legacy. Agentic multi-pass OCR is a real product category for accuracy-critical workloads."))

    story.append(h2("Slice 3 \u2014 Open-Source OCR Engines & Self-Hostable Libraries"))
    story.append(body("Two distinct tiers. Classic CPU-friendly engines (Tesseract 5.5.2, PaddleOCR PP-OCRv5, EasyOCR, OCRmyPDF, Kraken, RapidOCR) remain valuable for clean text, edge devices, and air-gapped deployments but are no longer competitive on layout, tables, or formulas. The 2024\u20132026 wave of VLM-based document pipelines (Marker, Surya, olmOCR-2, MinerU, PaddleOCR-VL, Docling) dominates benchmarks \u2014 MinerU3 reports 95.69 on OmniDocBench v1.6. Licensing is now a first-class selection criterion: Docling (MIT) and MinerU (Apache-2.0 as of April 2026) are the commercial-safest high-quality choices."))

    story.append(h2("Slice 4 \u2014 Intelligent Document Processing (IDP) Platforms"))
    story.append(body("Gartner published its first IDP Magic Quadrant in September 2025, naming Hyperscience, ABBYY, Tungsten Automation, UiPath, and Infrrd as Leaders. Two structural shifts dominate: (1) every platform has replaced rigid templates with prompt-tunable LLM/VLM extraction; and (2) a consolidation wave \u2014 UiPath acquired WorkFusion (Feb 2026), Sirion acquired Eigen Technologies, Klippa joined SER Group, AlphaSense acquired Tegus + Carousel. Vertical specialists remain strongly differentiated where domain data is specific."))

    # --- Comparison Matrix (landscape) ---
    story.append(NextPageTemplate("landscape"))
    story.append(PageBreak())
    story.append(h1("Comparison Matrix \u2014 Leading Tools"))
    story.append(body("Dimensions: Type, Deployment, Primary Strength, Notable Weakness, Cost (~2026), License / Lock-in, Best For. Tools ordered by slice."))
    story.append(Spacer(1, 0.15 * inch))
    story.append(build_matrix_table())

    # --- Back to portrait for deep dives ---
    story.append(NextPageTemplate("portrait"))
    story.append(PageBreak())

    # Deep Dive Slice 1
    story.append(h1("Deep Dive \u2014 Slice 1: Foundation-Model / VLM-Based OCR"))
    story.append(body("The central finding: generalist frontier VLMs lead on breadth and ease-of-use, but small document-post-trained open-weight models now hold the top of every pure-OCR benchmark. Document-specific post-training beats scale."))

    story.append(h2("Frontier Proprietary VLMs"))
    story.append(bullet("<b>OpenAI GPT-5 / GPT-5.4</b> \u2014 Lowest OmniDocBench edit distance (0.02) among frontier APIs. Handles dense scans, handwritten forms, engineering diagrams in a single pass. Pricing: $1.75/$14 per 1M tokens. Weakness: no native bboxes; occasional \u201csilent correction\u201d of typos."))
    story.append(bullet("<b>Anthropic Claude Sonnet 4.6 / Opus 4.7</b> \u2014 The hallucination leader (~0.09% on CC-OCR). Opus 4.7 introduced high-resolution image support (2576 px). Sonnet 4.6 released Feb 2026; 1M-context beta since Aug 2025. Pricing: Sonnet $3/$15, Opus $5/$25. Strong for agentic document workflows."))
    story.append(bullet("<b>Google Gemini 3 Pro / 2.5 Flash</b> \u2014 Gemini 3 Pro leads OmniDocBench v1.5 among frontier APIs (overall ED 0.115). Flash is the cheapest credible frontier vision API. Added as first-class OCR model in Tensorlake and Google Document AI Layout Parser."))
    story.append(bullet("<b>xAI Grok 4 / Grok Vision</b> \u2014 Image analysis + OCR added July 2025. ~80\u201385% accuracy on straightforward docs; lags GPT-5/Claude on vision specifics. Narrower adoption."))
    story.append(bullet("<b>Cohere Aya Vision / Command A Vision</b> \u2014 Multilingual across 23 languages. Aya Vision is open-weight but non-commercial (CC-BY-NC). Struggles on pure document-OCR prompts."))

    story.append(h2("Open-Weight VLMs"))
    story.append(bullet("<b>Qwen3-VL / Qwen3.5-VL</b> \u2014 Open-weight SOTA; 32 languages; robust to blur/tilt. Qwen3.5 reportedly breaks 90 on OmniDocBench v1.5. Apache-2.0 / Qwen license."))
    story.append(bullet("<b>InternVL 3 / 3.5</b> \u2014 InternVL3-78B hits OCRBench 906, DocVQA ~95. Supports 4K images. Fully open-weight."))
    story.append(bullet("<b>DeepSeek-OCR-2 (3B)</b> \u2014 91.09 on OmniDocBench v1.5 at 3B params; SOTA for small models. Runs on single consumer GPU."))
    story.append(bullet("<b>Mistral Pixtral 12B</b> \u2014 Apache-2.0; strong ChartQA (83.7%); 128k context. Pairs with Mistral OCR 3 for production."))
    story.append(bullet("<b>MiniCPM-V 4.5</b> \u2014 Edge-friendly; 46.7% of Qwen2.5-VL-7B's VRAM. Strong on-device OCR for English."))
    story.append(bullet("<b>Meta Llama 3.2 Vision (11B/90B)</b> \u2014 Common OSS baseline (~82% OCR accuracy). Hallucinates on complex charts."))
    story.append(bullet("<b>AI2 Molmo / PixMo</b> \u2014 Fully open (weights + data + code); 2D pointing grounding. CVPR 2025. Not document-specialized."))

    story.append(h2("Slice 1 Takeaways"))
    story.append(bullet("Frontier API choice is primarily an error-profile choice: Claude (low hallucination) vs. GPT-5 (low edit distance) vs. Gemini (cheap and long)."))
    story.append(bullet("For self-hosters, PaddleOCR-VL-1.5, DeepSeek-OCR-2, and olmOCR-2 beat generalist frontier VLMs at a fraction of cost."))
    story.append(bullet("Hallucination mitigation (MARINE at ICML 2025, contextual-embedding detectors) is the new accuracy frontier."))
    story.append(bullet("OmniDocBench v1.5 is widely regarded as saturated; LlamaIndex\u2019s Real5-OmniDocBench and ParseBench are successors."))

    # Deep Dive Slice 2
    story.append(h1("Deep Dive \u2014 Slice 2: Cloud Hyperscaler & Managed OCR APIs"))

    story.append(h2("Hyperscaler Document Services"))
    story.append(bullet("<b>AWS Textract</b> \u2014 DetectDocumentText, AnalyzeDocument (Forms/Tables/Queries/Signatures). June 2025 accuracy update. Pricing: $1.50/1k (Detect) to $65/1k (AnalyzeDocument). No built-in Markdown output."))
    story.append(bullet("<b>Google Cloud Document AI</b> \u2014 Gemini 3-backed Layout Parser, 92\u201396% accuracy on complex tables, native DOCX/PPTX/XLSX support. Layout Parser $10/1k pages. Broadest processor catalog."))
    story.append(bullet("<b>Azure AI Document Intelligence</b> \u2014 Custom Generative Extraction (schema-in, JSON-out with citations) GA 2025. Read $1.50/1k, Prebuilt $10/1k, Custom $30/1k."))

    story.append(h2("API-First Specialists"))
    story.append(bullet("<b>Mistral OCR 3</b> \u2014 Purpose-built OCR VLM. Vendor-reported 88.9% handwriting, 96.6% tables. $2/1k pages; $1/1k Batch API. Multi-cloud distribution."))
    story.append(bullet("<b>Reducto</b> \u2014 Agentic OCR: bounding-box detector + VLM verification. $0.015/page. 99.24% on clinical SLAs. $108M total funding. 1B+ pages processed."))
    story.append(bullet("<b>LlamaParse v2</b> \u2014 Four tiers with swappable VLM backends. Credit pricing $1.25/1k credits; Fast \u2248 1 credit/page, Agentic Plus 10+."))
    story.append(bullet("<b>Unstructured.io</b> \u2014 25+ file types; normalized element tree. Fast $1/1k, Hi-Res $10/1k. SOC 2 Type 2. Strong RAG preprocessing."))
    story.append(bullet("<b>Upstage Document Parse</b> \u2014 Strong on Asian languages. Parse $0.01/page; Extract +$0.03/page. SOC 2; AWS Marketplace."))
    story.append(bullet("<b>Jina Reader</b> \u2014 URL-to-Markdown; also handles PDFs. 10M free tokens per key. Best-fit for web-heavy RAG ingestion."))

    story.append(h2("Slice 2 Takeaways"))
    story.append(bullet("VLMs are now the OCR backbone beneath both hyperscaler and specialist APIs."))
    story.append(bullet("Mistral OCR 3 + Unstructured Fast redefine price-floor: $1\u20132 per 1k pages."))
    story.append(bullet("Structured Markdown/JSON + bbox + chunk IDs are the default output contract."))
    story.append(bullet("Hyperscalers win on compliance; specialists win on price and hard-document accuracy."))

    # Deep Dive Slice 3
    story.append(h1("Deep Dive \u2014 Slice 3: Open-Source OCR Engines & Libraries"))

    story.append(h2("Classic CPU-Friendly Engines"))
    story.append(bullet("<b>Tesseract 5.5.2</b> \u2014 Apache-2.0, ~73.6k stars. LSTM for 100+ languages. Maintenance-only cadence."))
    story.append(bullet("<b>PaddleOCR 3.4.1</b> \u2014 Apache-2.0, ~76k stars. Unified PP-OCRv5 + PaddleOCR-VL-1.5 (0.9B VLM). 109 languages. 94.5% OmniDocBench."))
    story.append(bullet("<b>EasyOCR 1.7.2</b> \u2014 Apache-2.0, ~29k stars. Simple Python API, 80+ languages. Last release ~19 months old."))
    story.append(bullet("<b>OCRmyPDF 17.4.1</b> \u2014 MPL-2.0, ~33k stars. Canonical PDF\u2192searchable-PDF pipeline. Actively maintained."))
    story.append(bullet("<b>RapidOCR 3.8.1</b> \u2014 Apache-2.0. ONNX/OpenVINO wrapper. Python/C++/Java/C#/Go/JS bindings. Default embedded OCR for Docling."))

    story.append(h2("VLM-Based Document Pipelines"))
    story.append(bullet("<b>Surya 0.17.1 + Marker 1.10.2</b> \u2014 GPL-3.0. PDF\u2192Markdown/JSON. Monthly releases. Excellent on academic papers."))
    story.append(bullet("<b>olmOCR-2 (7B)</b> \u2014 Apache-2.0. Qwen2.5-VL-7B fine-tune. 82.4 on olmOCR-Bench, beating Marker (76.1) and MinerU (75.8). GRPO RL training."))
    story.append(bullet("<b>MinerU 3.1.0</b> \u2014 Apache-based (relicensed Apr 2026 from AGPL-3.0). ~60k stars. 95.69 on OmniDocBench v1.6. Extremely active."))
    story.append(bullet("<b>Docling 2.90</b> \u2014 MIT, ~58k stars. IBM Research / LF governance. Pluggable OCR + table models. LangChain/LlamaIndex integrations."))
    story.append(bullet("<b>Unstructured OSS 0.22.21</b> \u2014 Apache-2.0, ~14.5k stars. Broad \u201cany doc \u2192 chunked elements\u201d ETL for RAG."))

    story.append(h2("Slice 3 Takeaways"))
    story.append(bullet("VLM-based pipelines top OmniDocBench and beat frontier APIs at 100\u00d7 lower cost for self-hosters."))
    story.append(bullet("Licensing is first-class: <b>Docling (MIT), MinerU (Apache), Tesseract/PaddleOCR/olmOCR (Apache-2.0)</b> are commercial-safe."))
    story.append(bullet("GPU-first vs CPU-first has split cleanly: classic engines serve edge/offline; VLM pipelines serve server workloads."))

    # Deep Dive Slice 4
    story.append(h1("Deep Dive \u2014 Slice 4: IDP Platforms & Vertical Specialists"))

    story.append(h2("Enterprise IDP (Gartner 2025 Leaders)"))
    story.append(bullet("<b>Hyperscience</b> \u2014 Blocks-and-flows architecture; ORCA VLM; government/FSI. $250k\u2013$1M+ annually. \u201cIntelligent Inference\u201d Spring 2026 rebrand."))
    story.append(bullet("<b>ABBYY Vantage 3.0</b> \u2014 35+ year heritage, 200+ skills. Direct Azure OpenAI integration. Strong on-prem story."))
    story.append(bullet("<b>Tungsten TotalAgility</b> \u2014 Full-stack capture + RPA + orchestration. Platform unified launch Sept 2025. GenAI Copilots."))
    story.append(bullet("<b>UiPath Document Understanding</b> \u2014 Autopilot for IXP; Generative Validation. Feb 2026: acquired WorkFusion for financial-crime vertical."))
    story.append(bullet("<b>Infrrd</b> \u2014 Inaugural 2025 Gartner Leader; mortgage/insurance strength; HITL guarantees."))
    story.append(bullet("<b>Rossum Aurora</b> \u2014 Transactional-specific LLM (DocILE-trained); template-free; direct ERP connectors. 500+ enterprise customers."))

    story.append(h2("Mid-Market IDP & Vertical Specialists"))
    story.append(bullet("<b>Nanonets</b> \u2014 Low-code workflow builder; consumption pricing. $0\u2013$999/mo."))
    story.append(bullet("<b>Docsumo</b> \u2014 Lending/insurance focus. Free 100 credits, Growth $299/mo."))
    story.append(bullet("<b>Veryfi</b> \u2014 Receipts/invoices; sub-5s mobile SDK + API; fraud detection."))
    story.append(bullet("<b>Mathpix</b> \u2014 STEM/math/chem OCR; LaTeX output; SuperNet-108 deployed 2025."))
    story.append(bullet("<b>Ocrolus</b> \u2014 Consumer/SMB lending; bank statements, tax returns, fraud. 175+ lenders. Encore platform (Oct 2025)."))
    story.append(bullet("<b>MyScript</b> \u2014 Digital ink SDK; 70+ languages; on-device. SDK 4.3 (Jan 2026)."))

    story.append(h2("Slice 4 Takeaways"))
    story.append(bullet("LLM/VLM extraction is replacing hand-built templates. Schema-from-samples + prompt-tunable extraction is the new floor."))
    story.append(bullet("Consolidation wave: UiPath+WorkFusion, Sirion+Eigen, SER+Klippa, Tungsten+Kofax+Ephesoft, AlphaSense+Tegus+Carousel."))
    story.append(bullet("IDP moat is shifting from extraction accuracy (commoditizing) to workflow, HITL, governance, and ERP integration depth."))
    story.append(bullet("Identity verification is a separate fraud-ML arms race against deepfakes \u2014 not an OCR problem."))

    # Recommendations
    story.append(h1("Recommendations by Use Case"))
    recs = [
        ("1. RAG pipeline over messy internal PDFs (commercial, self-hosted)", "Start with <b>Docling</b> (MIT) for breadth or <b>MinerU 3.1</b> (Apache) for quality. Add <b>RapidOCR</b> as fallback. Avoid Marker/Surya unless you license Datalab commercially."),
        ("2. RAG pipeline fast, willing to pay per page", "<b>LlamaParse v2</b> (Cost-Effective) or <b>Unstructured.io Fast</b>. For harder docs, <b>Mistral OCR 3</b> at $2/1k pages. <b>Reducto</b> if 99%+ accuracy SLAs needed."),
        ("3. Extract invoices/POs/receipts into ERP at scale", "<b>Rossum Aurora</b> (T-LLM, ERP connectors) or <b>SAP Document AI</b> on S/4HANA. <b>Veryfi</b> for mobile. <b>Nanonets</b>/<b>Docsumo</b> for mid-market."),
        ("4. Government / regulated / air-gapped", "<b>Hyperscience</b> (ORCA VLM, air-gapped) or <b>ABBYY Vantage 3.0</b> (on-prem DNA). <b>Azure AI Doc Intelligence</b> for Azure Government."),
        ("5. STEM / academic papers \u2192 LaTeX", "<b>Mathpix</b> (managed, industry-standard) or <b>Marker</b> + <b>olmOCR-2</b> (self-hosted, GPL caveat on Marker)."),
        ("6. Historical manuscripts / RTL / medieval scripts", "<b>Kraken</b> (Apache-2.0) in the eScriptorium ecosystem."),
        ("7. Mobile app OCR without cloud dependency", "<b>MyScript</b> (digital ink), <b>MiniCPM-V 4.5</b> (on-device VLM), or <b>RapidOCR</b> (CoreML/ONNX)."),
        ("8. Maximize accuracy, cost is secondary", "<b>Reducto</b> (agentic multi-pass), <b>Azure Custom Generative Extraction</b>, or <b>LlamaParse Agentic Plus</b>. Raw-VLM: <b>GPT-5.4</b> for edit distance, <b>Claude Opus 4.7</b> for low hallucination."),
        ("9. Minimize cost, self-host on a single GPU", "<b>DeepSeek-OCR-2 (3B)</b> or <b>PaddleOCR-VL-1.5 (0.9B)</b> \u2014 both run on a single consumer GPU."),
        ("10. Identity verification for KYC/onboarding", "<b>Entrust/Onfido</b>, <b>Jumio</b>, or <b>Sumsub</b>. Separate category \u2014 pick on fraud-ML maturity."),
        ("11. Replace aging Tesseract pipeline", "<b>RapidOCR</b> (CPU, cross-language bindings). <b>PaddleOCR PP-OCRv5</b> for GPU. <b>Docling</b> to add table/formula handling."),
    ]
    for title, desc in recs:
        story.append(Paragraph(f"<b>{title}</b>", ParagraphStyle("recTitle", parent=styles["Body"], spaceBefore=10, spaceAfter=2, fontName="Helvetica-Bold")))
        story.append(body(desc))

    # Sources
    story.append(h1("Sources and References"))
    story.append(body("<i>This report synthesizes four parallel research streams run on 2026-04-20. Pricing reflects published vendor rate cards. Benchmark figures are cited from source; several are vendor-reported and should be verified before procurement decisions.</i>"))
    story.append(Spacer(1, 0.1 * inch))

    story.append(h2("Slice 1 \u2014 VLM-based OCR"))
    for s in [
        "CodeSOTA \u2014 Best OCR Models 2026 & OmniDocBench Leaderboard",
        "OpenDataLab OmniDocBench (CVPR 2025)",
        "LlamaIndex \u2014 \u201cOmniDocBench is Saturated, What\u2019s Next\u201d",
        "OpenAI Cookbook \u2014 GPT-5.4 Multimodal Document Tips",
        "Claude API Pricing & Vision Docs (platform.claude.com)",
        "Qwen3-VL, InternVL3, DeepSeek-OCR-2, MiniCPM-V 4.5, Molmo \u2014 GitHub/arXiv",
        "ICML 2025 \u2014 MARINE Hallucination Mitigation",
    ]:
        story.append(source_bullet(s))

    story.append(h2("Slice 2 \u2014 Managed APIs"))
    for s in [
        "AWS Textract, Google Document AI, Azure AI Document Intelligence \u2014 Official pricing",
        "Mistral OCR 3 announcement & pricing (mistral.ai)",
        "Reducto \u2014 Series B funding, hybrid architecture deep dive",
        "LlamaParse v2, Unstructured.io, Upstage, Jina Reader \u2014 Official docs",
    ]:
        story.append(source_bullet(s))

    story.append(h2("Slice 3 \u2014 Open-Source"))
    for s in [
        "Tesseract, PaddleOCR, EasyOCR, OCRmyPDF, Kraken, RapidOCR, docTR \u2014 GitHub repos",
        "Surya, Marker, olmOCR-2, MinerU 3.1, Docling 2.90 \u2014 GitHub repos & announcements",
    ]:
        story.append(source_bullet(s))

    story.append(h2("Slice 4 \u2014 IDP & Verticals"))
    for s in [
        "Gartner Magic Quadrant for IDP Solutions (Sept 2025)",
        "ABBYY, Hyperscience, UiPath, Tungsten \u2014 Press releases",
        "Rossum Aurora, Automation Anywhere, SAP Business AI \u2014 Official announcements",
        "Acquisition coverage: UiPath+WorkFusion, Sirion+Eigen, AlphaSense+Tegus",
        "WEF 2026 \u2014 Digital Identity + Deepfakes report",
    ]:
        story.append(source_bullet(s))

    doc.build(story)
    print(f"Wrote {OUT_PATH} ({os.path.getsize(OUT_PATH):,} bytes)")


if __name__ == "__main__":
    build_pdf()
