# Research And Report Generation Workflow Starter

This is the starter workspace for the workshop exercise:

https://claude-docs.devbionics.com/docs/skills-plugins-deep-dive/#-workshop-exercise-research-and-report-generation-workflow

You will use Claude Code to build a research report from scratch, then publish it into multiple native document formats.

The completed reference is in:

```text
../research-report-generation-workflow-completed/
```

Use that folder only after the exercise, or if you get stuck and want to compare expected outputs.

## Goal

By the end of the exercise, this starter folder should contain:

```text
ocr_tech_scan.md
ocr_tech_scan.docx
ocr_tech_scan.pdf
ocr_tech_scan.pptx
ocr_tech_scan.xlsx
```

The topic is a 2026 technology scan of OCR tools, but the workflow applies to any research-heavy deliverable.

## Prerequisites

- Claude Code
- The `document-skills` plugin installed
- Web search enabled
- This folder open as your working directory

## Phase 1: Research With Parallel Agents

Copy the prompt from:

```text
prompts/phase-1-research.md
```

Paste it into Claude Code while your current directory is this starter folder.

Expected behavior:

- Claude proposes four research slices before searching.
- Claude spawns one sub-agent per slice.
- The sub-agents research in parallel.
- Claude synthesizes the results into `ocr_tech_scan.md`.

Open `ocr_tech_scan.md` and skim it before moving on. The report should be useful as a draft technology scan, not just a short search summary.

## Phase 2: Publish Deliverables

Run these prompts in order:

```text
prompts/phase-2-docx.md
prompts/phase-2-pdf.md
prompts/phase-2-pptx.md
prompts/phase-2-xlsx.md
```

Each prompt asks Claude to use the appropriate document skill and save a real native file in this folder.

## Review

After all files are generated:

- Compare the markdown report to the Word and PDF versions. Did the format add useful structure?
- Open the PowerPoint. Is it a briefing, or did it copy too much prose?
- Open the spreadsheet. Is the comparison matrix easier to scan and filter?
- Compare your output to the completed reference folder.

The workshop takeaway is the workflow: parallel sub-agents create research breadth, and document skills translate the same source into format-appropriate deliverables.
