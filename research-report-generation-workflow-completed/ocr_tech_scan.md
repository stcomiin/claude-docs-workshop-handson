# OCR Technology Scan — 2026

*Snapshot date: 2026-04-20. Prepared from four parallel research streams covering frontier VLMs, managed cloud OCR APIs, open-source engines, and enterprise IDP platforms.*

---

## Executive Summary

OCR as a distinct category has effectively dissolved into document understanding. In the last 12–18 months, vision-language models — both frontier (GPT-5, Claude 4.x, Gemini 3) and small document-specialized open-weight models (PaddleOCR-VL-1.5 at 0.9B, DeepSeek-OCR-2 at 3B, MinerU2.5 at 1.2B, olmOCR-2 at 7B) — have collapsed the classic layout-detect → recognize → reconstruct pipeline into a single forward pass that emits Markdown or JSON directly. On public benchmarks like OmniDocBench v1.5/1.6, small open-weight document VLMs now match or exceed frontier APIs at 100× lower per-page cost. Pricing has compressed brutally on the managed side (Mistral OCR 3 at $1–$2 per 1,000 pages vs. $30–$65 for the hyperscalers' form-parsing tiers), while the enterprise IDP category is being reshaped simultaneously by GenAI-first re-platformings and a consolidation wave (UiPath acquiring WorkFusion, Sirion acquiring Eigen, Klippa into SER Group, Tungsten rolling up Kofax + Ephesoft).

For anyone choosing OCR tooling today, the right question is no longer "which OCR engine?" but "where on the stack do I want to sit?" — raw VLM in your own inference, managed API with structured JSON, self-hosted document pipeline, or full IDP workflow platform. The cost, accuracy, and control trade-offs between those four choices are now larger than the trade-offs inside any one of them.

---

## Landscape Overview

**Slice 1 — Foundation-model / VLM-based OCR.** Frontier multimodal LLMs from OpenAI, Anthropic, Google, xAI, and Cohere can read documents end-to-end in a single pass; open-weight alternatives (Qwen3-VL, InternVL3, DeepSeek-OCR-2, MiniCPM-V 4.5, Llama 3.2 Vision, Molmo, Pixtral) have closed — and in some cases crossed — the gap on pure document benchmarks. The paradigm shift is that small, document-specialized VLMs post-trained on OCR/layout/table/formula objectives now beat generalist frontier models on OmniDocBench while running on a single consumer GPU. Hallucination (silent correction, fabricated content) remains the biggest reliability concern; Claude consistently leads on hallucination rate (~0.09% on CC-OCR), GPT-5 on raw text edit distance, and Gemini 3 on price/performance at length. Cost curves have dropped roughly 80% since 2024 when you combine newer models with prompt caching and batch APIs.

**Slice 2 — Cloud hyperscaler & managed OCR APIs.** The "send bytes, receive structured text" category splits into two clear tiers. Hyperscalers (AWS Textract, Google Document AI, Azure AI Document Intelligence) compete on compliance, regional coverage, prebuilt catalog breadth (tax forms, mortgages, IDs), and deep SDK integration — and they've all bolted VLMs onto their stacks (Google's Layout Parser now runs on Gemini 3 Flash/Pro). API-first specialists (Mistral OCR 3, Reducto, LlamaParse, Unstructured.io, Upstage Document Parse, Jina Reader) compete on price, Markdown/JSON fidelity, and raw accuracy on hard documents. Mistral OCR 3 at $1–2 per 1,000 pages and Unstructured Fast at $1 per 1,000 pages make Textract AnalyzeDocument ($65) look legacy. Agentic multi-pass OCR (Reducto, LlamaParse Agentic Plus, Azure Custom Generative Extraction) is a real product category for accuracy-critical workloads.

**Slice 3 — Open-source OCR engines & self-hostable libraries.** Two distinct tiers. Classic CPU-friendly engines (Tesseract 5.5.2, PaddleOCR PP-OCRv5, EasyOCR, OCRmyPDF, Kraken, RapidOCR) remain valuable for clean text, edge devices, and air-gapped deployments but are no longer competitive on layout, tables, or formulas. The 2024–2026 wave of VLM-based document pipelines (Marker, Surya, olmOCR/olmOCR-2, MinerU/MinerU2.5, PaddleOCR-VL, Docling, GOT-OCR 2.0, Nougat) dominates benchmarks — MinerU3 reports 95.69 on OmniDocBench v1.6, ahead of Gemini 3 Pro and Qwen3-VL-235B. Licensing is now a first-class selection criterion: Docling (MIT) and MinerU (Apache-2.0 as of April 2026) are the commercial-safest high-quality choices; Marker and Surya (both GPL-3.0) push commercial users toward paid Datalab licenses.

**Slice 4 — Intelligent Document Processing (IDP) platforms & vertical specialists.** Gartner published its first IDP Magic Quadrant in September 2025, naming Hyperscience, ABBYY, Tungsten Automation, UiPath, and Infrrd as Leaders. Two structural shifts dominate: (1) every platform has replaced rigid templates with prompt-tunable LLM/VLM extraction (Rossum Aurora T-LLM, Hyperscience ORCA, UiPath Autopilot for IXP, Appian DocCenter); and (2) a consolidation wave — UiPath acquired WorkFusion (Feb 2026), Sirion acquired Eigen Technologies, Klippa joined SER Group, AlphaSense acquired Tegus + Carousel. Vertical specialists remain strongly differentiated where the domain data is specific: Veryfi (receipts), Mathpix (STEM/math), Ocrolus (lending), MyScript (digital ink/handwriting), Onfido/Jumio/Entrust (identity verification, now a fraud-ML arms race against deepfakes).

---

## Comparison Matrix — Leading Tools

Dimensions chosen: **Type**, **Deployment**, **Primary Strength**, **Notable Weakness**, **Cost (~2026)**, **License / Lock-in**, **Best For**. Tools are ordered by slice.

| Tool | Type | Deployment | Primary Strength | Notable Weakness | Cost (approx., 2026) | License / Lock-in | Best For |
|---|---|---|---|---|---|---|---|
| **GPT-5 / GPT-5.4** | Frontier VLM | API (OpenAI, Azure) | Lowest edit distance on OmniDocBench among frontier APIs | Costly vs open-weight; no native bboxes | ~$1.75 / $14 per 1M tokens | Proprietary, vendor lock-in | Hardest documents where cost is secondary |
| **Claude Sonnet 4.6 / Opus 4.7** | Frontier VLM | API (Anthropic, Bedrock, Vertex) | Lowest hallucination rate on CC-OCR (~0.09%); 1M-token context; high-res vision | Higher image-token cost on long PDFs | Sonnet 4.6: $3 / $15 per 1M tokens | Proprietary | Agentic doc workflows; compliance-sensitive extraction |
| **Gemini 3 Pro / 2.5 Flash** | Frontier VLM | API (Google, Vertex) | Top OmniDocBench score among frontier APIs; cheapest Flash tier | Grounding/bbox via prompting only | Gemini 2.5 Flash among cheapest vision APIs | Proprietary | Long-document, high-volume, price-sensitive |
| **Qwen3-VL / Qwen3.5-VL** | Open-weight VLM | Self-host / hosted API | Open-weight SOTA; 32 languages; strong on Asian scripts | 235B variant heavy to self-host | Free (Apache/Qwen license); hosted ~$0.10–$0.30 / 1M tokens | Apache-2.0 / Qwen License | Multilingual self-hosted document AI |
| **DeepSeek-OCR-2 (3B)** | Document-specialized VLM | Self-host / hosted | SOTA small-model on OmniDocBench v1.5 (91.09); runs on single consumer GPU | Narrower general-VLM reasoning | Free; hosted ~$0.15 / 1M tokens | Open weights | Dense layout / optical-compression use cases |
| **PaddleOCR-VL-1.5 (0.9B)** | Document-specialized VLM | Self-host | 94.5% OmniDocBench v1.5; 109 languages; NaViT dynamic resolution | Paddle ecosystem friction (improving) | Free | Apache-2.0 | Multilingual, self-hosted, GPU-available |
| **AWS Textract** | Managed API (hyperscaler) | Managed (AWS) | Mature Forms/Tables/Queries; FedRAMP/HIPAA; Layout feature for RAG | Quality lags VLM-backed APIs on handwriting/complex tables | $1.50 / 1k pages (Detect); $65 / 1k (AnalyzeDocument) | Proprietary; AWS lock-in | Regulated US enterprise on AWS |
| **Google Document AI** | Managed API (hyperscaler) | Managed (GCP) | Gemini 3-backed Layout Parser; rich processor catalog (invoices, tax, contracts) | Processor sprawl; narrower data-residency | Layout Parser $10 / 1k; Form Parser $30 / 1k | Proprietary; GCP lock-in | Enterprises already on Vertex AI / BigQuery |
| **Azure AI Document Intelligence** | Managed API (hyperscaler) | Managed (Azure) | Prebuilt tax/mortgage/ID models; Custom Generative Extraction (schema-in, JSON-out with citations) | Dense SKU matrix; handwriting behind Mistral | Read $1.50 / 1k; Prebuilt $10 / 1k; Custom Gen $30 / 1k | Proprietary; Azure lock-in | Microsoft/Azure shops; regulated industries |
| **Mistral OCR 3** | API specialist (VLM-backed) | Managed (Mistral, Azure, Bedrock) | 88.9% handwriting, 96.6% tables (vendor); EU-hosted option | Vendor-reported headline benchmarks | **$2 / 1k pages** ($1 with Batch) | Proprietary but cross-cloud distributed | High-accuracy at low cost; EU data residency |
| **Reducto** | API specialist (agentic) | Managed | Hybrid multi-pass OCR + VLM verification; 99.24% on clinical SLAs | Slower than single-pass; narrower compliance (SOC 2/HIPAA) | **$0.015 / page** (~$15 / 1k) | Proprietary | Enterprise accuracy-critical (healthcare, financial) |
| **LlamaParse v2** | API specialist | Managed | Tiered modes (Fast / Agentic Plus); LlamaIndex-native; pinned model versions | Credit-based pricing complexity | Fast ~$1.25 / 1k pages; Agentic Plus ~$12+ / 1k | Proprietary | RAG/agent pipelines already on LlamaIndex |
| **Unstructured.io (API)** | API specialist | Managed | 25+ file types; element-tree output; RAG-first | OCR quality = underlying engine | Fast $1 / 1k; Hi-Res $10 / 1k | Proprietary | RAG ingestion over heterogeneous corpora |
| **Tesseract 5.5.2** | OSS engine (classic) | Self-host (CPU) | 100+ languages; runs anywhere; reference baseline | Weak on layout/tables/handwriting | Free | Apache-2.0 | Clean printed text, offline/edge, archival |
| **PaddleOCR 3.4.1** | OSS engine (classic + VLM) | Self-host | Most active classic OCR; PP-OCRv5 + PaddleOCR-VL unified | Paddle-framework-leaning historically | Free | Apache-2.0 | Self-hosted multilingual OCR at any scale |
| **Surya + Marker** | OSS VLM pipeline | Self-host (GPU preferred) | PDF→Markdown; tables/math/multi-column | **GPL-3.0** requires commercial license from Datalab | Free (OSS) / paid (Datalab commercial) | GPL-3.0 | Academic / technical PDF conversion, non-commercial |
| **olmOCR-2 (7B)** | OSS VLM (Ai2) | Self-host (GPU) | Qwen2.5-VL fine-tune; 82.4 on olmOCR-Bench; Markdown + LaTeX | 16–20 GB VRAM at FP8; English-leaning | Free | Apache-2.0 | LLM pretraining-corpus construction, scale OCR |
| **MinerU 3.1** | OSS VLM pipeline | Self-host (GPU preferred) | 95.69 on OmniDocBench v1.6; native DOCX parsing | GPU-first; smaller English community | Free | **Apache-based (as of Apr 2026)** | Commercial self-hosted, top-quality pipeline |
| **Docling 2.90** | OSS VLM pipeline (IBM) | Self-host (CPU + GPU) | MIT-licensed; pluggable VLMs (Granite-Vision); LF governance | Slightly below MinerU on headline benchmarks | Free | **MIT** | Commercial-safe enterprise RAG preprocessing |
| **Rossum Aurora** | Enterprise IDP | SaaS / private cloud | Transactional T-LLM; template-free; direct ERP connectors | Narrow to AP/PO/order confirmations | From ~$1,500/mo; enterprise $30k–$150k+ | Proprietary | AP automation, transactional documents |
| **ABBYY Vantage 3.0** | Enterprise IDP | SaaS / on-prem | 200+ pre-trained skills; deep compliance; 35+ yr heritage | Heavy deployment; migration friction | Enterprise quote, mid-six-figure typical | Proprietary | Regulated enterprises needing on-prem |
| **Hyperscience Hypercell** | Enterprise IDP | SaaS / on-prem / air-gapped | ORCA VLM; blocks-and-flows architecture; government-grade | Premium pricing; long implementation | $250k–$1M+ annual | Proprietary | Government, FSI, air-gapped HITL |
| **UiPath Document Understanding** | Enterprise IDP | SaaS | Tightest RPA binding; Autopilot for IXP; Generative Validation | Consumption (AI Unit) pricing can escalate | AI Unit consumption; 1–2 units/page | Proprietary | Shops already on UiPath RPA |
| **Tungsten TotalAgility** | Enterprise IDP | SaaS / on-prem | Kofax + Ephesoft + TotalAgility rollup; wide ERP/RPA footprint | SKU confusion post-consolidation | $100k+ annual floor | Proprietary | Large bank/government, existing Kofax base |
| **Nanonets** | Mid-market IDP | SaaS | Low-code workflow builder; fast TTV | Depth gaps for regulated enterprise | Consumption-based; $200 signup credits; plans $0–$999/mo | Proprietary | SMB/mid-market, rapid deployment |
| **Docsumo** | Mid-market IDP | SaaS | Lending/insurance focus; transparent pricing | Lighter integrations than enterprise tier | Free (100 credits); Growth $299/mo | Proprietary | Mid-market FS/insurance |
| **Veryfi** | Vertical (receipts) | SaaS / Mobile SDK | Sub-5s receipt extraction; mobile SDK | Narrow to receipts/invoices/checks | Free tier; Enterprise from $500/mo | Proprietary | Expense mgmt, field service |
| **Mathpix** | Vertical (STEM) | Managed API | Industry-standard math/chem OCR; LaTeX output | Narrow to scientific docs | Per-snip / per-page quotes | Proprietary | Publishers, EdTech, LLM STEM training data |
| **Ocrolus** | Vertical (lending) | SaaS | Bank statements, tax returns, fraud detection | US lending-specific | Enterprise quote | Proprietary | Consumer/SMB lending |
| **MyScript** | Vertical (digital ink) | SDK / on-device | Stroke-based handwriting in 70+ languages | Not image OCR — digital ink only | OEM licensing | Proprietary | Note-taking apps, OEM integrations |

---

## Deep Dive — Slice 1: Foundation-Model / VLM-Based OCR

The central finding: generalist frontier VLMs lead on breadth and ease-of-use, but small document-post-trained open-weight models now hold the top of every pure-OCR benchmark. Document-specific post-training beats scale.

### Frontier proprietary VLMs

- **OpenAI GPT-5 / GPT-5.4** — Lowest OmniDocBench edit distance (0.02) among frontier APIs for raw character recognition; composite score (~85.8) trails document-specialized open models. Handles dense scans, handwritten forms, engineering diagrams, chart-heavy reports in a single pass. Pricing (GPT-5.2): $1.75/$14 per 1M input/output tokens; Batch + prompt caching can cut this ~95%. Weakness: no native bboxes/confidence; occasional "silent correction" of typos in source.

- **Anthropic Claude Sonnet 4.6 / Opus 4.7** — The hallucination leader (~0.09% on CC-OCR). Opus 4.7 introduced high-resolution image support (2576 px). Sonnet 4.6 released Feb 2026; 1M-context beta since Aug 2025. Pricing: Sonnet $3/$15, Opus $5/$25, Haiku $1/$5. Edit distance (0.145) behind GPT-5 and document-specialized open models. Strong for agentic document workflows via Amazon Bedrock.

- **Google Gemini 3 Pro / 2.5 Flash** — Gemini 3 Pro leads OmniDocBench v1.5 among frontier APIs (overall ED 0.115). Flash is the cheapest credible frontier vision API. Added as a first-class OCR model in Tensorlake and Google Document AI Layout Parser. Weaker on visual grounding without prompt scaffolding.

- **xAI Grok 4 / Grok Vision** — Image analysis + OCR added in Grok 4 (July 9, 2025). Collections API preserves PDF/Excel/code layout. OCR accuracy ~80–85% on straightforward docs; lags GPT-4o/Claude on vision specifics. Narrower adoption for OCR.

- **Cohere Aya Vision / Command A Vision** — Multilingual across 23 languages, unusual breadth. Aya Vision (Mar 3, 2025) is open-weight but **non-commercial (CC-BY-NC)**; Command A Vision (July 2025, 112B) is commercial via Cohere API. Aya struggles on pure document-OCR prompts in independent tests.

### Open-weight VLMs

- **Qwen3-VL / Qwen3.5-VL (Alibaba)** — Open-weight SOTA; 32 languages (up from 10 in 2.5-VL); robust to blur/tilt; long-document structure parsing improved. Qwen3.5 family reportedly breaks 90 on OmniDocBench v1.5. Apache-2.0 / Qwen license; widely integrated into OSS pipelines.

- **InternVL 3 / 3.5 (OpenGVLab)** — InternVL3-78B hits OCRBench 906, DocVQA ~95. Supports 4K images. V2PE improves long-context. Fully open-weight.

- **DeepSeek-VL2 / DeepSeek-OCR / DeepSeek-OCR-2** — DeepSeek-OCR (Oct 2025) introduced "Contexts Optical Compression" and native-resolution encoding. DeepSeek-OCR-2 (Jan 27, 2026) at 3B params hits 91.09 on OmniDocBench v1.5 — SOTA for small models. Open weights.

- **Mistral Pixtral 12B** — Apache-2.0; strong ChartQA (83.7%); 128k context. Often paired with Mistral OCR 3 (Slice 2) for production document parsing.

- **MiniCPM-V 4.5 (OpenBMB)** — Edge-friendly; 77.0 on OpenCompass with 46.7% of Qwen2.5-VL-7B's VRAM. Strong on-device OCR for English.

- **Meta Llama 3.2 Vision (11B/90B)** — Common OSS baseline (~82% OCR accuracy). Hallucinates on complex charts; multilingual weaker than Qwen. No verified Llama 4 Vision OCR-specialized release as of April 2026.

- **AI2 Molmo / PixMo** — Fully open (weights + data + code); 2D pointing grounding useful for click-paths. CVPR 2025. Not document-specialized (that's olmOCR in Slice 3).

### Slice 1 takeaways

- Frontier API choice is primarily an error-profile choice: Claude (low hallucination) vs. GPT-5 (low edit distance) vs. Gemini (cheap and long).
- For self-hosters, PaddleOCR-VL-1.5, DeepSeek-OCR-2, and olmOCR-2 (Slice 3) beat generalist frontier VLMs on document benchmarks at a fraction of the cost.
- Hallucination mitigation (image-grounded decoding, MARINE at ICML 2025, contextual-embedding detectors) is the new accuracy frontier.
- OmniDocBench v1.5 is widely regarded as saturated; LlamaIndex's Real5-OmniDocBench and ParseBench are the successors to watch.

---

## Deep Dive — Slice 2: Cloud Hyperscaler & Managed OCR APIs

### Hyperscaler document services

- **AWS Textract** — DetectDocumentText, AnalyzeDocument (Forms/Tables/Queries/Signatures), AnalyzeExpense/ID, Layout feature for RAG chunking. June 2025 accuracy update added superscripts/subscripts, rotated text, RotationAngle, better box-form handling. Pricing: $1.50/1k (Detect) to $65/1k (AnalyzeDocument, first 1M). No built-in Markdown output.

- **Google Cloud Document AI** — Headline feature for 2026: Gemini 3-backed Layout Parser (`v1.6-2026-01-13` Flash, `v1.6-pro-2025-12-01` Pro), 92–96% accuracy on complex tables, native DOCX/PPTX/XLSX support with chunking. Layout Parser $10/1k pages (includes chunking); Form Parser $30/1k. Processor catalog remains the broadest (W-2, 1099, contracts, mortgages, etc.).

- **Google Cloud Vision API (OCR)** — Lightweight sync OCR with bounding boxes; 50+ languages. $1.50/1k first 1M units, $0.60/1k above 5M. Most mature OCR SLA on GCP.

- **Azure AI Document Intelligence** — Now inside Azure AI Foundry Tools; prebuilt catalog (invoice, receipt, ID, tax W-2/1095/1099/W-4, bank statement, mortgage 1003/1004/1005, contract). **Custom Generative Extraction** (schema-in, JSON-out with grounded citations and confidence) went GA in 2025 and underpins the broader Content Understanding service. Read $1.50/1k, Prebuilt $10/1k, Custom Extraction $30/1k.

### API-first specialists

- **Mistral OCR 3 (Dec 2025)** — Purpose-built OCR VLM, not a thin wrapper. Markdown + JSON with inline figure handling, tables, equations, multilingual. Vendor-reported 88.9% handwriting (vs Azure 78.2%), 96.6% tables (vs Textract 84.8%). **$2/1k pages; $1/1k with Batch API.** Distributed via Mistral, Azure AI Foundry, AWS Bedrock.

- **Reducto** — "Agentic OCR": bounding-box detector + VLM verification passes. Four verbs: Parse, Extract, Split, Edit. **$0.015/page** on Standard PAYG; volume discounts. Reports 99.24% on clinical SLAs; published RD-TableBench. **$75M Series B led by a16z (Feb 2026), $108M total.** 1B+ pages processed cumulatively (6× growth in 6 months).

- **LlamaParse v2** — Four tiers (Fast / Cost-Effective / Agentic / Agentic Plus) with swappable VLM backends (GPT-4.1, Gemini 2.5 Pro on top tiers). Pinned model versions. Credit pricing at $1.25/1k credits; Fast ≈ 1 credit/page, Agentic Plus 10+ credits/page.

- **Unstructured.io (API)** — 25+ file types; normalized element tree (Title, NarrativeText, Table, etc.). Fast $1/1k, Hi-Res $10/1k. SOC 2 Type 2. Strong RAG preprocessing default.

- **Upstage Document Parse** — Korean AI company; strong on Asian languages; layout-aware serialization; "Enhanced mode" (late 2025) adds visual understanding. **Parse $0.01/page; Extract +$0.03/page.** SOC 2; AWS Marketplace.

- **Jina Reader / Reader-LM** — URL-to-Markdown (prepend `r.jina.ai/`); also handles PDFs. 10M free tokens per new key; top-ups ~$0.02/1M tokens. New pricing rolled out May 6, 2025. Best-fit for web-heavy RAG ingestion.

- **Nanonets OCR API** — Raw OCR endpoint separate from their IDP product. 100+ languages, table OCR, form extraction. $200 initial credits; per-block pricing opaque above that.

- **ABBYY Cloud OCR SDK** — Mature FineReader engine, 200+ languages, dozens of output formats. $0.02–$0.10/page quoted range. Legacy feel but industrial reliability.

### Slice 2 takeaways

- VLMs are now the OCR backbone beneath both hyperscaler and specialist APIs. "Classic OCR" (Textract DetectDocumentText, Vision API TEXT_DETECTION) is relegated to cheap first-pass.
- Mistral OCR 3 + Unstructured Fast redefine price-floor: $1–$2 per 1k pages at quality competitive with hyperscaler premium tiers.
- Structured Markdown/JSON + bbox + chunk IDs are now the default output contract.
- Hyperscalers win on compliance, data-residency, prebuilt verticals; specialists win on price, Markdown/JSON fidelity, and hard-document accuracy. AWS Marketplace and Azure AI Foundry distribution is bringing the two camps together.

---

## Deep Dive — Slice 3: Open-Source OCR Engines & Libraries

### Classic CPU-friendly engines

- **Tesseract 5.5.2** (2025-12-26) — Apache-2.0, ~73.6k stars. LSTM recognition for 100+ languages. Solid on clean text; not competitive on tables/layout/handwriting. Maintenance-only cadence.

- **PaddleOCR 3.4.1** (Baidu) — Apache-2.0, ~76k stars. Now unified: lightweight PP-OCRv5 + **PaddleOCR-VL-1.5 (0.9B VLM)** built on NaViT encoder + ERNIE-4.5-0.3B. **109 languages.** Reports 94.5% overall on OmniDocBench v1.5. v3.3.0 (Oct 2025) launched PaddleOCR-VL; v3.4.0 (Jan 2026) the 1.5 release; v3.4.1 (Apr 2026) added llama-cpp-server and AMD/Intel Arc backends.

- **EasyOCR 1.7.2** — Apache-2.0, ~29k stars. Simple Python API, 80+ languages. Last tagged release ~19 months old; ecosystem-trailing.

- **OCRmyPDF 17.4.1** — **MPL-2.0**, ~33k stars. Canonical PDF→searchable-PDF pipeline wrapping Tesseract. Actively maintained.

- **Kraken** — Apache-2.0, historical-manuscript specialist (Hebrew, Arabic, Syriac, medieval). Core of eScriptorium. Niche but indispensable for digital humanities.

- **Calamari** — **GPL-3.0**; historical Latin printed text. Low-activity.

- **RapidOCR 3.8.1** — Apache-2.0, ~6.4k stars. ONNX/OpenVINO/MNN/PaddlePaddle/TensorRT/PyTorch wrapper around PP-OCR. Python/C++/Java/C#/Go/JS bindings. CoreML experimental. Increasingly the default embedded OCR engine for Docling and others.

- **Mindee docTR 1.0.1** — Apache-2.0. v1.0 (July 2025) dropped TensorFlow; PyTorch-only now. Solid conventional DL OCR; behind VLM pipelines on tables/formulas.

- **Microsoft TrOCR (in unilm)** — MIT. Line-level transformer encoder-decoder; pair with a detector. No significant advance since 2023–2024.

### VLM-based document pipelines (GPU-forward)

- **Surya 0.17.1** (Datalab, ex-VikParuchuri) — **GPL-3.0**, ~19.6k stars. Bundles layout + detection + recognition + reading order + table structure across 90+ languages. Powers Marker.

- **Marker 1.10.2** (Datalab) — **GPL-3.0**, ~34k stars. PDF→Markdown/JSON. Monthly releases; v1.10 (Sep 2025) shipped new Surya layout model. Excellent on academic papers.

- **olmOCR / olmOCR-2 (7B)** (Allen Institute for AI) — Apache-2.0, ~17k stars. Qwen2.5-VL-7B fine-tune for document OCR. Markdown + HTML tables + LaTeX math. olmOCR-2 reports 82.4 on olmOCR-Bench, beating Marker (76.1) and MinerU (75.8) per Ai2. GRPO RL on unit-test-style rewards.

- **MinerU 3.1.0** (OpenDataLab / Shanghai AI Lab) — **Apache-based (as of Apr 2026, relicensed from AGPL-3.0)**, ~60k stars. MinerU2.5-Pro VLM backend (1.2B). Reports **95.69 on OmniDocBench v1.6**, ahead of PaddleOCR-VL-1.5, Gemini 3 Pro, Qwen3-VL-235B. Native DOCX parsing (v3.0). Extremely active cadence.

- **Docling 2.90** (IBM Research; now under `docling-project` LF governance) — **MIT**, ~58k stars. Pluggable OCR (Tesseract/RapidOCR/EasyOCR) + table models (TableFormer, Granite-Vision) + layout. LangChain/LlamaIndex/watsonx integrations. Weekly cadence. Granite-Vision VLM for tables (v2.90); Nanonets OCR2 VLM (v2.87).

- **Unstructured (OSS library) 0.22.21** — Apache-2.0, ~14.5k stars. Broad "any doc → chunked elements" ETL for RAG. Calls underlying OCR engines.

- **GOT-OCR 2.0** — No commits in ~14 months; **no license declared** (redistribution risk). Early end-to-end OCR-2.0 model; superseded.

- **Nougat** (Meta) — MIT (code), **CC-BY-NC-4.0** (pretrained model, non-commercial). In archive mode. Academic PDF→LaTeX.

- **Pix2Text** — MIT, ~3k stars. Mathpix-alternative for formulas + tables; 80+ languages; CPU-friendly.

### Slice 3 takeaways

- VLM-based small-model pipelines (PaddleOCR-VL-1.5, DeepSeek-OCR-2, MinerU2.5-Pro, olmOCR-2) top OmniDocBench and beat frontier API VLMs on document parsing at 100× lower per-page cost for self-hosters.
- Licensing has become a first-class selection criterion. Commercial-safe tier: **Docling (MIT), MinerU (Apache as of Apr 2026), Tesseract/PaddleOCR/olmOCR/RapidOCR (Apache-2.0)**. GPL tier: **Marker + Surya** (route to Datalab commercial). Non-commercial gotchas: Nougat model weights, Aya Vision weights, GOT-OCR undeclared.
- GPU-first vs CPU-first has split cleanly: classic engines serve edge/offline; VLM pipelines serve server workloads.
- "OCR as RAG preprocessing" is now the dominant downstream framing — Markdown/JSON + chunking + bbox metadata are baseline.

---

## Deep Dive — Slice 4: IDP Platforms & Vertical Specialists

### Enterprise IDP (Gartner 2025 Leaders first)

- **Hyperscience** — Blocks-and-flows modular architecture; proprietary ORCA VLM; strong in government (SSA, VA, HMRC) and financial services (Amex, Schwab). On-prem/air-gapped capable. Typical deal $250k–$1M+ annually. Winter 2025 shipped "Chat with Documents"; Spring 2026 release rebrands as "Intelligent Inference" with model routing across extraction passes.

- **ABBYY Vantage 3.0** (Jan 2026) — 35+ year heritage, 200+ pre-trained skills, direct Azure OpenAI integration. Compliance/redaction, GenAI prompt library, agentic automation roadmap. Strong on-prem story.

- **Tungsten TotalAgility** (ex-Kofax, + Ephesoft Transact) — Full-stack capture + RPA + orchestration. Tungsten Automation Platform unified launch Sept 2025. GenAI Copilots 2024–25.

- **UiPath Document Understanding / IXP** — Autopilot for IXP auto-generates schemas; Generative Validation for GenAI second-opinion. 2025.10 added agentic IDP. **Feb 2026: UiPath acquired WorkFusion** — move into financial-crime vertical agents.

- **Infrrd** — Inaugural 2025 Gartner Leader; mortgage/insurance/semi-structured strength; human-in-the-loop guarantees.

- **Rossum Aurora** — Transactional-specific LLM trained on DocILE dataset; template-free; direct ERP connectors (NetSuite, SAP, Oracle, MS Dynamics, Coupa). 500+ enterprise customers.

- **Automation Anywhere Document Automation** — 2025 Gartner Customers' Choice (4.8/92%); agentic positioning with AI Agent Studio.

- **SAP Document Information Extraction** — Native S/4HANA/Ariba/Concur; Joule copilot; agentic AP flows in Q1 2026 release.

- **IBM Datacap / Content Intelligence** — Deep Cloud Pak for Business Automation and watsonx.ai integration. Older architecture; modernization via watsonx-native tools.

- **Appian DocCenter** — Low-code BPM-fused IDP; claims 99% STP with GenAI vs 60–70% legacy OCR. Appian 25.2 emphasized AI as infrastructure.

### Mid-Market IDP

- **Nanonets** — Low-code workflow builder; consumption-based pricing since Jan 2025 (no platform fees); $200 signup credits; plans $0–$999/mo.

- **Docsumo** — Lending, insurance, logistics focus. Free 100 credits, Growth $299/mo, Enterprise custom.

- **Klippa DocHorizon** — EU-strong; fraud/tampering detection unusual in category. **Now part of SER Group** (Content Services Platform Leader).

- **Instabase AI Hub** — $100M Series D Jan 2025. Foundation-model-centric; single-tenant Anthropic via Bedrock. Converse/Build no-code.

- **Super.AI** — Outcome-guarantee via LLMs + bots + crowd HITL. PII constraints apply.

- **Parseur** — Email + attachment parsing, 200+ OCR languages, 50-language handwriting. $39/mo (100 pages) to $9,999/mo (1M pages).

### Vertical specialists

- **Veryfi** — Receipts/invoices/checks; sub-5s mobile SDK + API; fraud detection. Free tier; Enterprise from $500/mo.

- **Mathpix** — STEM/math/chem OCR; LaTeX + Mathpix Markdown; SuperNet-108 deployed 2025. Customers include publishers and LLM training pipelines.

- **Ocrolus** — Consumer/SMB lending; bank statements, tax returns, pay stubs, fraud. Powers 175+ lenders. **Encore** (Oct 2025) first cross-lender SMB borrower intelligence.

- **MyScript** — Digital ink SDK; 70+ languages; on-device; note-taking apps and OEMs. SDK 4.3 (Jan 2026).

- **Taggun** — Fast receipt OCR API; 99% claim; from $4/mo, $0.08/scan PAYG.

- **Onfido (now Entrust) / Jumio** — Identity verification with liveness + biometrics + deepfake defense. Jumio reported **+88% YoY injection attacks 2025**. Category mutating fastest due to generative-AI fraud.

- **Sirion (post-Eigen acquisition)** — CLM + Document AI; Eigen's IDP engine now embedded in contract intelligence.

- **AlphaSense** — Financial research intelligence; **acquired Tegus $930M (July 2024), Carousel Oct 2025**.

### Slice 4 takeaways

- LLM/VLM extraction is replacing hand-built templates across the board. Schema-from-samples + prompt-tunable extraction is the new floor.
- Consolidation wave: UiPath+WorkFusion (Feb 2026), Sirion+Eigen, SER+Klippa, Tungsten+Kofax+Ephesoft, AlphaSense+Tegus+Carousel. Pure-play IDP is being absorbed into adjacent categories (CLM, RPA, ECM, research).
- Vertical GenAI copilots (WorkFusion Edward, Rossum Aurora, Hyperscience ORCA, SAP Joule) are where differentiation now lives.
- IDP vendors' moat is shifting from extraction accuracy (commoditizing) to workflow, HITL, governance, audit, vertical data models, ERP integration depth.
- Identity verification is a separate fraud-ML arms race against deepfakes — document OCR is only one component.

---

## Recommendations by Use Case

**1. Build a RAG pipeline over messy internal PDFs (commercial, self-hosted).**
Start with **Docling** (MIT, CPU+GPU pluggable) for breadth or **MinerU 3.1** (Apache, best OmniDocBench) for quality. Add **RapidOCR** as the embedded classic engine for edge/fallback. Avoid Marker/Surya unless you license Datalab commercially.

**2. Build a RAG pipeline fast, willing to pay per page.**
**LlamaParse v2** (Cost-Effective tier) or **Unstructured.io Fast**. For harder documents, **Mistral OCR 3** at $2/1k pages is the price/quality leader. Reducto if you need 99%+ accuracy with SLAs.

**3. Extract invoices/POs/receipts into ERP at enterprise scale.**
**Rossum Aurora** (transactional T-LLM, direct ERP connectors) or **SAP Document AI** if you're on S/4HANA. **Veryfi** for mobile receipts. **Nanonets** or **Docsumo** for mid-market fast time-to-value.

**4. Government / regulated / air-gapped deployment.**
**Hyperscience** (ORCA VLM, air-gapped capable) or **ABBYY Vantage 3.0** (on-prem DNA). **Azure AI Document Intelligence** if you're on Azure Government.

**5. Process scanned STEM / academic papers → LaTeX.**
**Mathpix** (managed, industry-standard) or **Marker** + **olmOCR-2** (self-hosted, GPL licensing caveat on Marker). **Nougat** remains archived — avoid for new work.

**6. Process historical manuscripts / right-to-left / medieval scripts.**
**Kraken** (Apache-2.0) in the eScriptorium ecosystem.

**7. Add OCR to a mobile app without sending bytes to the cloud.**
**MyScript** (digital ink, OEM), **MiniCPM-V 4.5** (on-device VLM), or **RapidOCR** (CoreML/ONNX, small footprint).

**8. Maximize accuracy, cost is secondary.**
**Reducto** (agentic multi-pass), **Azure Custom Generative Extraction** with citations, or **LlamaParse Agentic Plus** backed by GPT-4.1/Gemini 2.5 Pro. On the raw-VLM side: **GPT-5.4** for edit distance, **Claude Opus 4.7** for low hallucination.

**9. Minimize cost, self-host on a single GPU.**
**DeepSeek-OCR-2 (3B)** or **PaddleOCR-VL-1.5 (0.9B)** — both run on a single consumer GPU and hold top OmniDocBench scores.

**10. Identity verification for KYC / onboarding.**
**Entrust/Onfido**, **Jumio**, or **Sumsub**. This is a separate category — pick on fraud-ML maturity and deepfake defense, not OCR accuracy.

**11. Replace an aging Tesseract pipeline with a drop-in upgrade.**
**RapidOCR** if you need CPU and cross-language bindings. **PaddleOCR PP-OCRv5** if you can move to GPU and want a unified classic+VLM path. **Docling** if you want to also add table/formula/layout handling.

---

## Sources and References

### Slice 1 — VLM-based OCR
- CodeSOTA — Best OCR Models 2026 — https://www.codesota.com/ocr
- CodeSOTA — OmniDocBench Leaderboard — https://www.codesota.com/browse/computer-vision/document-parsing/omnidocbench
- OpenDataLab OmniDocBench (CVPR 2025) — https://github.com/opendatalab/OmniDocBench
- LlamaIndex — "OmniDocBench is Saturated, What's Next" — https://www.llamaindex.ai/blog/omnidocbench-is-saturated-what-s-next-for-ocr-benchmarks
- OpenAI Cookbook — GPT-5.4 Multimodal Document Tips — https://developers.openai.com/cookbook/examples/multimodal/document_and_multimodal_understanding_tips
- Claude API Pricing — https://platform.claude.com/docs/en/about-claude/pricing
- Claude Vision Docs — https://platform.claude.com/docs/en/build-with-claude/vision
- Tensorlake — Gemini 3 as an OCR Model — https://dev.to/tensorlake/gemini-3-is-now-available-as-an-ocr-model-in-tensorlake-4kfh
- Qwen3-VL GitHub — https://github.com/QwenLM/Qwen3-VL
- InternVL3 Blog (2025-04-11) — https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- DeepSeek-OCR-2 on Hugging Face — https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Analytics Vidhya — DeepSeek OCR 2 (Jan 2026) — https://www.analyticsvidhya.com/blog/2026/01/deepseek-ocr-2/
- MiniCPM-o / MiniCPM-V 4.5 GitHub — https://github.com/OpenBMB/MiniCPM-o
- Molmo and PixMo (CVPR 2025) — https://openaccess.thecvf.com/content/CVPR2025/papers/Deitke_Molmo_and_PixMo_Open_Weights_and_Open_Data_for_State-of-the-Art_CVPR_2025_paper.pdf
- Cohere Aya Vision Blog — https://cohere.com/blog/aya-vision
- xAI Grok Image Understanding Docs — https://docs.x.ai/docs/guides/image-understanding
- PaddleOCR-VL arXiv (2510.14528) — https://arxiv.org/abs/2510.14528
- OCRBench v2 arXiv (2501.00321) — https://arxiv.org/html/2501.00321v2
- ICML 2025 — MARINE Hallucination Mitigation — https://icml.cc/virtual/2025/poster/43644
- Hyperscience — VLMs Transforming Document Processing — https://www.hyperscience.ai/blog/out-of-the-box-to-state-of-the-art-how-vision-language-models-are-transforming-document-processing/

### Slice 2 — Managed APIs
- AWS Textract Pricing — https://aws.amazon.com/textract/pricing/
- Amazon Textract June 2025 update — https://aws.amazon.com/about-aws/whats-new/2025/06/amazon-textract-detectdocumenttext-analyzedocument-apis/
- Google Cloud Document AI Pricing — https://cloud.google.com/document-ai/pricing
- Google Document AI Gemini Layout Parser — https://docs.cloud.google.com/document-ai/docs/layout-parse-chunk
- Google Cloud Vision API Pricing — https://cloud.google.com/vision/pricing
- Azure AI Document Intelligence Pricing — https://azure.microsoft.com/en-us/pricing/details/document-intelligence/
- Azure Document Intelligence What's New — https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/whats-new?view=doc-intel-4.0.0
- Azure Generative field extraction preview — https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/azure-ai-document-intelligence-now-previewing-field-extraction-with-generative-a/4219481
- Introducing Mistral OCR 3 — https://mistral.ai/news/mistral-ocr-3
- Mistral AI Pricing — https://mistral.ai/pricing
- InfoQ — Mistral OCR 3 — https://www.infoq.com/news/2026/01/mistral-ocr3/
- PyImageSearch — Mistral OCR 3 review — https://pyimagesearch.com/2025/12/23/mistral-ocr-3-technical-review-sota-document-parsing-at-commodity-pricing/
- Reducto Pricing — https://reducto.ai/pricing
- Reducto $108M Series B — https://reducto.ai/blog/reducto-series-b-funding
- Reducto Hybrid Architecture — https://llms.reducto.ai/hybrid-architecture-agentic-ocr-deep-dive
- LlamaParse Pricing — https://www.llamaindex.ai/pricing
- Introducing LlamaParse v2 — https://www.llamaindex.ai/blog/introducing-llamaparse-v2-simpler-better-cheaper
- Unstructured Pricing Plans — https://unstructured.io/pricing
- Upstage Pricing — https://www.upstage.ai/pricing
- Upstage Document Parse Enhanced — https://www.upstage.ai/blog/en/document-parse-enhanced
- Jina Reader API — https://jina.ai/reader/
- Nanonets Pricing — https://nanonets.com/pricing
- OCR.space Free OCR API — https://ocr.space/ocrapi
- LlamaIndex — Best OCR Software of 2026 — https://www.llamaindex.ai/insights/best-ocr-software

### Slice 3 — Open-Source
- Tesseract (5.5.2) — https://github.com/tesseract-ocr/tesseract
- PaddleOCR (3.4.1) — https://github.com/PaddlePaddle/PaddleOCR
- PaddleOCR-VL coverage — https://www.marktechpost.com/2025/10/17/baidus-paddlepaddle-team-releases-paddleocr-vl-0-9b-a-navit-style-ernie-4-5-0-3b-vlm-targeting-end-to-end-multilingual-document-parsing/
- EasyOCR — https://github.com/JaidedAI/EasyOCR
- OCRmyPDF (17.4.1) — https://github.com/ocrmypdf/OCRmyPDF
- Kraken — https://github.com/mittagessen/kraken
- docTR (1.0.1) — https://github.com/mindee/doctr
- Microsoft TrOCR — https://github.com/microsoft/unilm
- Surya (0.17.1) — https://github.com/datalab-to/surya
- Marker (1.10.2) — https://github.com/datalab-to/marker
- olmOCR — https://github.com/allenai/olmocr
- olmOCR 2 announcement — https://allenai.org/blog/olmocr-2
- MinerU (3.1.0) — https://github.com/opendatalab/MinerU
- Docling (2.90) — https://github.com/docling-project/docling
- Unstructured OSS — https://github.com/Unstructured-IO/unstructured
- GOT-OCR 2.0 — https://github.com/Ucas-HaoranWei/GOT-OCR2.0
- Nougat — https://github.com/facebookresearch/nougat
- Pix2Text — https://github.com/breezedeus/Pix2Text
- RapidOCR (3.8.1) — https://github.com/RapidAI/RapidOCR

### Slice 4 — IDP & Verticals
- Gartner Magic Quadrant for IDP Solutions — https://www.gartner.com/en/documents/6912666
- ABBYY 2025 Gartner IDP Leader — https://www.abbyy.com/company/news/abbyy-leader-gartner-magic-quadrant-idp-2025/
- ABBYY Vantage 3.0 launch — https://martechseries.com/predictive-ai/ai-platforms-machine-learning/abbyy-launches-vantage-3-0-directly-integrating-with-generative-ai-and-offering-advanced-compliance-and-privacy-capabilities/
- Tungsten Automation 2025 Leader — https://www.tungstenautomation.com/about/press-releases/2025/tungsten-recognized-as-a-leader-in-2025-gartner-mq-for-intelligent-document-processing-solutions
- Hyperscience Spring 2026 "Intelligent Inference" — https://www.hyperscience.ai/newsroom/from-idp-to-intelligent-inference-spring-2026-release/
- UiPath Gartner IDP Leader — https://www.uipath.com/newsroom/uipath-positioned-as-a-leader-in-gartner-magic-quadrant-for-intelligent-document-processing
- UiPath Document Understanding 2025.10 — https://www.uipath.com/blog/product-and-updates/intelligent-document-processing-2025-10-release
- Rossum pricing — https://rossum.ai/pricing/
- Rossum Aurora LLM coverage — https://www.intelligentdocumentprocessing.com/idp-vendor-rossum-introduces-aurora-with-its-proprietary-llm/
- Automation Anywhere Customers' Choice 2025 — https://www.prnewswire.com/news-releases/automation-anywhere-recognized-as-a-2025-gartner-peer-insights-customers-choice-for-intelligent-document-processing-solutions-302516256.html
- SAP Business AI Q3 2025 — https://news.sap.com/2025/10/sap-business-ai-release-highlights-q3-2025/
- Appian DocCenter IDP — https://appian.com/products/platform/process-automation/intelligent-document-processing-idp
- WorkFusion $45M funding — https://www.prnewswire.com/news-releases/workfusion-raises-45-million-in-funding-to-fuel-growth-for-agentic-ai-for-financial-crime-compliance-302556469.html
- Infrrd 2025 Gartner Leader — https://www.businesswire.com/news/home/20251008512175/en/Infrrd-Named-a-Leader-in-Gartner-First-Ever-Magic-Quadrant-For-Intelligent-Document-Processing-Solutions
- Nanonets pricing — https://nanonets.com/pricing
- Docsumo comparison — https://www.docsumo.com/blog/the-best-ocr-software-comparison
- Instabase $100M Series D — https://siliconangle.com/2025/01/17/instabase-raises-100m-ai-powered-unstructured-data-platform/
- Parseur pricing — https://parseur.com/pricing
- Veryfi pricing — https://www.veryfi.com/pricing/
- Mathpix Convert API — https://mathpix.com/convert
- MyScript SDK — https://www.myscript.com/sdk/
- Taggun pricing — https://www.taggun.io/pricing
- Ocrolus Encore launch — https://www.prnewswire.com/news-releases/ocrolus-launches-encore-a-first-of-its-kind-trusted-cash-flow-data-sharing-platform-for-small-business-funding-302595729.html
- Sirion acquires Eigen — https://www.sirion.ai/library/contract-ai/eigen-acquisition-brings-document-ai-to-contract-intelligence/
- AlphaSense acquires Tegus $930M — https://www.prnewswire.com/news-releases/alphasense-completes-acquisition-of-tegus-302190934.html
- WEF 2026 digital identity + deepfakes — https://reports.weforum.org/docs/WEF_Unmasking_Cybercrime_Strengthening_Digital_Identity_Verification_against_Deepfakes_2026.pdf
- Forrester "AI Changes IDP Market" — https://www.forrester.com/blogs/ai-changes-the-intelligent-document-processing-idp-market/

### Methodology note
This report synthesizes four parallel research streams run on 2026-04-20, each using independent web searches. Pricing figures reflect published vendor rate cards or verified independent coverage; where prices are enterprise-quote-only, the report says so. Benchmark figures (OmniDocBench, olmOCR-Bench, CC-OCR, OCRBench) are cited from the source that reports them; several are vendor-reported and should be verified before procurement decisions. OmniDocBench v1.5 is widely described as saturated as of early 2026, so benchmark deltas below ~1 point should be treated as noise.
