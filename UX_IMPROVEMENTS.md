# Deep Research Agent — UX Testing Report

**Tested:** 2026-03-02
**Queries tested:**
1. "Impact of large language models on software developer productivity in 2025"
2. "Renewable energy adoption trends and challenges in Southeast Asia 2024-2025"

---

## What Works Well

- Queries run reliably and produce structured, well-organized reports
- The agent intelligently breaks topics into multiple sub-searches (6–8 per query)
- Reports have clear sections: intro, body with bold headings, conclusion
- "Researching…" button state gives basic feedback during processing

---

## Improvements to Make

### 1. Report text is dense and unformatted
The report renders as a wall of plain text. The agent already uses markdown-style bold (`**Section:**`) but it's not being rendered. **Render markdown** in the report output — headers, lists, bold — it'll make reports far more readable.

### 2. Source citations are not clickable
Every citation looks like `[Source: Web searches on "..."]`. These should be **real hyperlinks** to actual source pages, not just labels repeating the search query. This is the most significant trust/quality issue.

### 3. The "thinking" preamble leaks into the output
The report starts with `"Okay, I will conduct web searches..."` followed by the raw search query list. This is internal agent reasoning and shouldn't be shown to users — or should be collapsed into a subtle "Sources searched" expandable section.

### 4. No loading progress indicator
While researching, there's no feedback on which search is currently running. A step indicator like `Searching 3 of 6: "solar energy Southeast Asia"...` would reduce anxiety during the ~15–20 second wait.

### 5. Report has no title showing the query
The report section just says **"Report"** as a heading. It should display the query that was asked (e.g., `Report: Renewable Energy in Southeast Asia`) so users know which report they're looking at, especially if they run multiple.

### 6. No way to copy or export the report
There's no "Copy", "Download PDF", or "Export to Markdown" button. For a research tool, this is a key missing feature.

### 7. Previous report persists when you start a new one
When you submit a new query, the old report stays visible until the new one overwrites it. You should either clear it immediately on submit or show a "generating new report" skeleton state to avoid confusion.

---

## Sample Report Outputs

### Query 1: LLMs & Developer Productivity

> Impact of Large Language Models on Software Developer Productivity in 2025: A Research Report
>
> Searches performed: "LLMs impact on software developer productivity 2025", "AI coding assistants developer productivity 2025", "future of software development with AI 2025", "LLMs automating software development tasks 2025", "developer productivity metrics with AI assistance 2025", "challenges LLMs software development 2025"
>
> Key findings: Code generation, intelligent completion, bug detection, refactoring, and documentation are all being accelerated by LLMs. Challenges include accuracy, security vulnerabilities, bias, and over-reliance. Conclusion: significant positive productivity impact expected, balanced by need for critical thinking.

### Query 2: Renewable Energy in Southeast Asia

> Renewable Energy Adoption Trends and Challenges in Southeast Asia (2024-2025): A Research Report
>
> Searches performed: 8 sub-searches covering solar, wind, geothermal, hydropower, policy, targets, and challenges.
>
> Key findings: Solar and wind are fastest-growing; hydropower and geothermal remain important. Key blockers: policy uncertainty, grid infrastructure limits, financing barriers, land use conflicts, supply chain vulnerabilities. Conclusion: region is poised for significant growth but needs improved policy frameworks and grid upgrades.
