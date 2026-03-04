# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server (Turbopack) at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (Next.js config)
```

There are no tests. The app uses Next.js 16 with Turbopack — builds are fast.

## Environment Variables

Two keys are required in `.env.local`:
- `OPENROUTER_API_KEY` — routes to the LLM (currently `google/gemini-3-flash-preview`)
- `EXA_API_KEY` — powers all web search via the Exa API

## Architecture

### Request flow

1. User submits a query in the browser → `useChat` (`@ai-sdk/react`) POSTs to `/api/research`
2. The route runs `streamText` with a `search` tool backed by `lib/exa.ts` (`searchAndContents`, 5 results, 3000 char snippets)
3. The model calls the search tool repeatedly (up to `stepCountIs(15)` total steps), then writes a Markdown report
4. The route returns an AI SDK UI message stream (`toUIMessageStreamResponse()`)
5. `useChat` reconstructs `UIMessage[]` on the client; the three display components read from that array

### Component responsibilities

- **`ResearchSteps`** — reads `DynamicToolUIPart` entries (tool calls/results) out of assistant messages to render per-search status cards (pending spinner → done checkmark)
- **`ResearchReport`** — reads the last assistant message's text parts, strips any text before the first `# ` heading via `stripPreamble()`, renders with `react-markdown` (custom `<a>` for clickable citation links), and provides Copy + Export (.md) buttons
- **`ResearchForm`** — stateless form; `Ctrl/Cmd+Enter` submits

### State and persistence

All chat state lives in `app/page.tsx` via `useChat`. Two `localStorage` keys persist across page refreshes:
- `research-messages` — full `UIMessage[]` array (passed back as `initialMessages`)
- `research-last-query` — the last submitted query string (shown as the report subtitle)

The "Clear history" button wipes both keys and calls `setMessages([])`.

### Styling

Tailwind v4 + shadcn/ui components (in `components/ui/`). New shadcn components can be added with `npx shadcn add <component>`.

## Claude Code Skills

Two skills live in `.claude/skills/`:

- **`deep-research-baseline`** — `/deep-research-baseline [topic]`: a 5-phase research workflow (clarify → search → fetch → analyze → report) that runs directly in Claude Code using WebSearch/WebFetch. Includes a source evaluation rubric at `templates/source-evaluation.md` and a sample output at `examples/sample-output.md`.

- **`benchmark-research`** — `/benchmark-research`: generates 10 random queries, runs them through both the skill approach and the web app API (`POST /api/research`), scores results on coherence / structure / depth / citations / style, and writes all logs + a final assessment report to `logs/<timestamp>-*.md`.

## Changing the Model

The model is set in `app/api/research/route.ts` as a string passed to `openrouter(...)`. Any model available on OpenRouter can be substituted. The system prompt (`SYSTEM` constant in the same file) controls output format — keep the strict output rules if changing models, as weaker models tend to leak preamble text.
