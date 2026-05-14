# Research and report generation workflow completed reference

Completed reference for the workshop exercise:

https://claude-docs.devbionics.com/docs/skills-plugins-deep-dive/#-workshop-exercise-research-and-report-generation-workflow

This directory contains the answer-key version of the end-to-end workflow from the workshop:

1. Use parallel research agents to build a technology scan.
2. Synthesize the findings into one markdown source file.
3. Publish that source into Word, PDF, PowerPoint, and Excel deliverables.

The starter workspace is in:

```text
../research-report-generation-workflow-starter/
```

Use the starter during the live exercise. Use this completed folder afterward to compare outputs, inspect the generated artifacts, or rebuild the sample locally.

The sample topic is OCR tooling in 2026, so the generated files are named `ocr_tech_scan.*`.

## Files

| File | Purpose |
| --- | --- |
| `ocr_tech_scan.md` | Canonical source report produced by the research phase |
| `ocr_tech_scan.docx` | Word report with title page, table of contents, page numbers, and preserved tables |
| `ocr_tech_scan.pdf` | Executive-style PDF version of the report |
| `ocr_tech_scan.pptx` | 10-slide executive briefing |
| `ocr_tech_scan.xlsx` | Spreadsheet version of the comparison matrix plus category grouping |
| `build_docx.js` | Local builder for the Word file |
| `build_pdf.py` | Local builder for the PDF |
| `build_pptx.js` | Local builder for the slide deck |
| `build_xlsx.py` | Local builder for the spreadsheet |

## Prerequisites

For the live workshop path, use the starter directory. It includes the prompts without the completed outputs.

For this completed reference:

- Claude Code
- The Anthropic `document-skills` plugin installed
- Web search enabled
- A writable working directory

For local regeneration with the included scripts:

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Phase 1: Research with parallel agents

Use Claude Code to run the research phase. The important behavior is the workflow, not the exact OCR topic.

Prompt:

```text
Create a current technology scan of OCR tools as of 2026.

First, split the OCR landscape into four independent research slices that can be investigated in parallel with minimal overlap. Explain each slice briefly.

Then spawn one research agent per slice. Each agent should search independently and return the leading tools, strengths, limitations, pricing or licensing model, maturity, and notable recent changes.

After all agents return, synthesize the findings into one markdown report with:
- Executive summary
- One landscape overview paragraph per slice
- A comparison matrix using the most useful dimensions for this topic
- A deep dive per slice
- Recommendations by use case
- Sources and references

Save the report as ocr_tech_scan.md in this directory.
```

Expected result: `ocr_tech_scan.md` should read like a useful 4-8 page technology scan, not a single-pass search summary.

## Phase 2: Publish the report

Use the document skills to turn the markdown into native deliverables.

Word:

```text
Using the docx skill, convert ocr_tech_scan.md into a professional Word report. Include a title page, today's date, table of contents, page numbers, and preserve the comparison tables. Save it as ocr_tech_scan.docx.
```

PDF:

```text
Using the pdf skill, produce ocr_tech_scan.pdf from ocr_tech_scan.md. Use an executive report style with a running header, page numbers, and a comparison matrix that remains readable across pages.
```

PowerPoint:

```text
Using the pptx skill, create a 10-slide executive briefing from ocr_tech_scan.md:
1. Title
2. Executive summary
3. Landscape overview
4-7. One slide per research slice
8. Comparison matrix
9. Recommendations
10. Sources

Keep each slide concise and slide-native.
```

Spreadsheet:

```text
Using the xlsx skill, extract the comparison matrix from ocr_tech_scan.md into ocr_tech_scan.xlsx. Add a second worksheet that groups tools by category with pricing tier and best-fit use case.
```

## Rebuild locally

The checked-in sample files can also be rebuilt with local scripts:

```bash
source .venv/bin/activate
npm run build
```

Individual targets:

```bash
npm run build:docx
npm run build:pdf
npm run build:pptx
npm run build:xlsx
```

The local builders are included so the sample is reproducible outside Claude Code. In the live workshop, the document-skills plugin is the primary path because it demonstrates skill-triggered file creation.

## What to review

After generating the files, compare each output against `ocr_tech_scan.md`:

- Did parallel agents produce broader research than one sequential prompt?
- Did the Word and PDF outputs add useful document structure?
- Did the slide deck compress the report instead of copying paragraphs?
- Did the spreadsheet make the comparison matrix easier to filter and scan?

The workshop takeaway is that the workflow improves the result: sub-agents create research breadth, and document skills translate the same source into format-appropriate deliverables.
