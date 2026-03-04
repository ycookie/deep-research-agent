---
name: benchmark-research
description: Benchmark the deep-research-baseline skill against the local research web app. Auto-generates 10 randomized queries across different domains, runs both systems, scores results on 5 axes, and saves all logs + a final assessment report to the logs/ folder.
argument-hint: (no arguments — queries are auto-generated)
allowed-tools: WebSearch, WebFetch, Bash, Read, Write
---

# Research Benchmark

You are running a head-to-head benchmark between two research approaches:

- **Skill** — multi-phase structured research using `deep-research-baseline` methodology (WebSearch + WebFetch + synthesis), executed directly by you
- **Web App** — the local Next.js research app at `http://localhost:3000`, called via its `/api/research` POST endpoint and parsed from the AI SDK data stream

Work through all phases below in order. Log everything as you go — do not batch writes to the end.

> **Time warning:** This benchmark runs 10 queries × 2 systems = 20 research sessions. Expect 45–90 minutes of total runtime. Do not skip queries or truncate outputs.

---

## Phase 0: Setup

### 0a. Generate timestamp and prepare log directory

Run this and keep the TIMESTAMP value for all filenames in this session:

```bash
mkdir -p logs
date +"%d-%m-%y-%H%M"
```

All files created in this session use the naming pattern:
- Per-query skill report: `logs/<TIMESTAMP>-q<N>-skill.md`
- Per-query app report: `logs/<TIMESTAMP>-q<N>-app.md`
- Per-query comparison: `logs/<TIMESTAMP>-q<N>-comparison.md`
- Final report: `logs/<TIMESTAMP>-assessment.md`

### 0b. Verify the web app is running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If the response is not `200`, stop and tell the user to run `npm run dev` first.

---

## Phase 1: Generate 10 Research Queries

Generate exactly 10 specific, answerable research queries spanning distinct domains. Use this distribution:

| # | Domain |
|---|--------|
| 1–2 | Science / Technology |
| 3–4 | Society / Politics / Policy |
| 5–6 | Economics / Business / Markets |
| 7–8 | Health / Medicine / Public Health |
| 9 | History / Culture / Arts |
| 10 | Wildcard (interdisciplinary or unexpected) |

**Query quality rules:**
- Specific enough to yield a focused report (not "explain AI")
- Not so narrow it returns zero sources (not "what did X say on exact date Y")
- Phrased as research questions, not conversational prompts
- Varied complexity — mix of straightforward and nuanced

**Good examples:**
- "What are the current engineering challenges and recent breakthroughs in solid-state battery technology for electric vehicles?"
- "How has China's Belt and Road Initiative affected debt levels and political alignment in sub-Saharan Africa since 2015?"
- "What does current evidence say about the long-term cardiovascular risks of GLP-1 receptor agonists like semaglutide?"

Write out all 10 queries in a numbered list before proceeding. You will use the exact same query text for both the skill approach and the web app approach.

---

## Phase 2: Skill-Based Research (all 10 queries)

For each query (Q1 through Q10), conduct structured research **directly** using your WebSearch and WebFetch tools. Follow the condensed `deep-research-baseline` methodology:

### Per-query research process

**Step A — Search (3 focused searches):**
1. Core factual query — direct search for the topic
2. Recent developments — include the current year (2026) to surface latest findings
3. Alternative/contrarian angle — criticism, counterevidence, or competing perspectives

**Step B — Fetch and extract (fetch 4–5 top sources):**
- Use targeted `WebFetch` prompts (not generic "summarize this")
- Good prompt pattern: "What specific data, findings, or arguments does this source present about [topic]? Include named researchers, institutions, statistics, and dates."
- After each fetch, note: URL, publication, date, key findings, credibility tier (1–4 per the source-evaluation template), and what it uniquely contributes

**Step C — Synthesize report:**

Write the report in this exact structure:

```markdown
# [Topic Title]

**Date:** [today] | **Sources consulted:** [N]

## Executive Summary
[2–4 sentences. Lead with the answer if there is one.]

## Key Findings

### [Theme 1]
- Finding (Confidence: HIGH/MEDIUM/LOW)

### [Theme 2]
...

## Areas of Debate or Uncertainty
[Competing views with attribution]

## Knowledge Gaps
[What wasn't answered; suggestions for further research]

## Sources
1. [Publication] — "[Title]" ([Date]) — [URL]
```

### Logging each skill result

After completing each query's research, immediately write the full report to a log file using Write:

**File:** `logs/<TIMESTAMP>-q<N>-skill.md`

```markdown
# Skill Report — Q<N>

**Query:** [exact query text]
**Approach:** deep-research-baseline (skill)
**Searches run:** [N]
**Sources fetched:** [N]
**Timestamp:** [datetime]

---

[Full synthesized report here]
```

Repeat for all 10 queries before moving to Phase 3.

---

## Phase 3: Web App Research (all 10 queries)

For each query (Q1 through Q10), call the local web app API using Bash. Use this exact command template, substituting the query:

```bash
QUERY='[EXACT QUERY TEXT — single-quoted, escape any single quotes as '"'"']'
curl -s -N -X POST "http://localhost:3000/api/research" \
  -H "Content-Type: application/json" \
  --max-time 360 \
  -d "{\"messages\":[{\"id\":\"bench-$(date +%s)\",\"role\":\"user\",\"content\":\"$QUERY\",\"parts\":[{\"type\":\"text\",\"text\":\"$QUERY\"}]}]}" \
  | awk '/^0:/{print substr($0,3)}' \
  | python3 -c "
import sys, json
chunks = []
for line in sys.stdin:
    line = line.strip()
    try:
        chunks.append(json.loads(line))
    except Exception:
        pass
print(''.join(chunks))
"
```

**Wait for each curl call to complete fully** before proceeding to the next query. The app runs 4–6 web searches internally; allow up to 6 minutes per query.

**Error handling:**
- If curl times out: log `[TIMEOUT — no response within 360s]` and continue
- If output is empty or only whitespace: log `[EMPTY RESPONSE]` and continue
- If the output lacks a `# ` heading (possible preamble leak): log the raw output anyway, note it in the comparison

### Logging each app result

Immediately after each curl call completes, write to a log file:

**File:** `logs/<TIMESTAMP>-q<N>-app.md`

```markdown
# App Report — Q<N>

**Query:** [exact query text]
**Approach:** Web App (localhost:3000/api/research)
**Timestamp:** [datetime]

---

[Full curl output here — do not truncate]
```

Repeat for all 10 queries before moving to Phase 4.

---

## Phase 4: Comparative Assessment (all 10 queries)

Read back each pair of log files and score both outputs on 5 axes.

### Scoring rubric (1–10 per axis)

| Axis | 1–3 (Poor) | 4–6 (Adequate) | 7–9 (Good) | 10 (Excellent) |
|------|------------|----------------|------------|----------------|
| **Coherence** | Claims contradict; no logical flow | Some gaps or inconsistencies | Well-argued, mostly consistent | Airtight logic, every claim supported |
| **Structure / Format** | Wall of text, no hierarchy | Headers present but inconsistent | Clear sections, good use of bullets | Perfectly scannable, ideal hierarchy |
| **Depth** | Surface-level only | Covers basics, misses nuance | Substantive, explores complexity | Expert-level, addresses edge cases and debate |
| **Citations** | No sources or bare URLs | Some sources, few inline | Named sources, mostly linked | Inline links throughout, dated, credible mix |
| **Style / Tone** | Casual, sloppy, or overly hedged | Serviceable but inconsistent | Professional and clear | Authoritative, precise, well-calibrated |

### Per-query comparison log

For each query N, write:

**File:** `logs/<TIMESTAMP>-q<N>-comparison.md`

```markdown
# Comparison — Q<N>

**Query:** [exact query text]

## Scores

| Axis | Skill | App |
|------|-------|-----|
| Coherence | /10 | /10 |
| Structure / Format | /10 | /10 |
| Depth | /10 | /10 |
| Citations | /10 | /10 |
| Style / Tone | /10 | /10 |
| **Total** | **/50** | **/50** |

## Qualitative Notes

[4–6 sentences. Cover: which approach was stronger overall and why; the most notable difference between the two outputs; any failure modes observed (preamble leak, missing citations, thin sourcing, hallucinated links); anything surprising.]
```

---

## Phase 5: Final Assessment Report

After all 10 comparisons are written, compute aggregate scores and write the final report.

**File:** `logs/<TIMESTAMP>-assessment.md`

```markdown
# Research Benchmark — Final Assessment

**Run date:** [date and time]
**Queries evaluated:** 10
**Systems compared:**
- **Skill:** deep-research-baseline (multi-phase WebSearch + WebFetch + synthesis)
- **App:** Web App at localhost:3000 (Gemini 2.0 Flash via OpenRouter, streamed API)

---

## Overall Scores

| # | Query (abbreviated) | Skill | App | Winner |
|---|---------------------|-------|-----|--------|
| Q1 | [first ~6 words] | /50 | /50 | Skill / App / Tie |
| Q2 | ... | | | |
| Q3 | ... | | | |
| Q4 | ... | | | |
| Q5 | ... | | | |
| Q6 | ... | | | |
| Q7 | ... | | | |
| Q8 | ... | | | |
| Q9 | ... | | | |
| Q10 | ... | | | |
| **Average** | | **/50** | **/50** | |

---

## Axis Breakdown

| Axis | Skill Avg | App Avg | Delta (Skill − App) |
|------|-----------|---------|----------------------|
| Coherence | | | |
| Structure / Format | | | |
| Depth | | | |
| Citations | | | |
| Style / Tone | | | |
| **Overall** | | | |

---

## Key Findings

### Where the Skill Approach Excels
[2–3 paragraphs with specific examples from the queries]

### Where the Web App Excels
[2–3 paragraphs with specific examples]

### Systematic Patterns and Observations
[2–3 paragraphs covering consistent differences across queries — e.g., does one approach always have better citations? Does one tend to write preambles? Does one go deeper on certain topic types?]

---

## Failure Modes Observed

List any systematic issues found in either approach:

### Skill failures
- [e.g., "Q3: Depth score dragged down by only 3 sources fetched"]

### App failures
- [e.g., "Q1, Q5, Q7: Output began with preamble text before # heading"]

---

## Recommendations

Provide 4–6 specific, actionable recommendations for improving either system based on what the benchmark revealed. Reference specific queries where possible.

1.
2.
3.
4.
5.

---

## Log Index

| File | Contents |
|------|----------|
| `logs/<TIMESTAMP>-q1-skill.md` | Skill report for Q1 |
| `logs/<TIMESTAMP>-q1-app.md` | App report for Q1 |
| `logs/<TIMESTAMP>-q1-comparison.md` | Scores + notes for Q1 |
| ... | ... |
| `logs/<TIMESTAMP>-assessment.md` | This file |
```

---

## Execution Checklist

Work through this in order. Check each off as you go:

- [ ] Timestamp generated, `logs/` directory created
- [ ] Web app verified running (HTTP 200)
- [ ] 10 queries generated and listed
- [ ] Q1–Q10 skill research completed and logged
- [ ] Q1–Q10 app research completed and logged
- [ ] Q1–Q10 comparison files written with scores
- [ ] Final assessment report written with all tables and analysis

Once the final report is written, tell the user:
- The timestamp prefix used for all files
- The overall winner (skill vs app) and by how much
- The single most important improvement recommendation
- The path to the final assessment file
