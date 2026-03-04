'use client';

import { UIMessage, isToolUIPart, DynamicToolUIPart } from 'ai';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchStep {
  query: string;
  state: 'pending' | 'done' | 'error';
  results?: SearchResult[];
}

interface ResearchStepsProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function extractSearchSteps(messages: UIMessage[]): SearchStep[] {
  const steps: SearchStep[] = [];

  for (const message of messages) {
    if (message.role !== 'assistant') continue;

    for (const part of message.parts) {
      if (!isToolUIPart(part)) continue;

      const toolPart = part as unknown as DynamicToolUIPart;
      if (toolPart.toolName !== 'search') continue;

      const { state } = toolPart;

      if (state === 'input-streaming' || state === 'input-available') {
        const query = (toolPart.input as { query?: string })?.query ?? '';
        steps.push({ query, state: 'pending' });
      } else if (state === 'output-available') {
        const query = (toolPart.input as { query?: string })?.query ?? '';
        const results = toolPart.output as SearchResult[] | undefined;
        steps.push({ query, state: 'done', results });
      } else if (state === 'output-error') {
        const query = (toolPart.input as { query?: string })?.query ?? '';
        steps.push({ query, state: 'error' });
      }
    }
  }

  return steps;
}

export function ResearchSteps({ messages, isLoading }: ResearchStepsProps) {
  const steps = extractSearchSteps(messages);

  if (steps.length === 0 && !isLoading) return null;

  return (
    <div className="lg:w-[240px] xl:w-[260px] shrink-0 flex flex-col gap-4">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.15em]">
          Search Trace
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {steps.length === 0 ? (
        <div className="flex items-center gap-3 px-1">
          <div className="w-[11px] h-[11px] rounded-full border border-amber-500/50 bg-amber-500/10 flex items-center justify-center shrink-0">
            <div className="w-[5px] h-[5px] rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-xs font-mono text-muted-foreground/50">Preparing searches…</span>
        </div>
      ) : (
        <div className="relative flex flex-col">
          {/* Vertical timeline connector */}
          <div className="absolute left-[5px] top-3 bottom-3 w-px bg-border/25" />

          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 pb-4 last:pb-0 animate-step-enter"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Timeline dot */}
              <div
                className={`relative mt-1.5 w-[11px] h-[11px] shrink-0 rounded-full border flex items-center justify-center z-10 ${
                  step.state === 'pending'
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : step.state === 'done'
                    ? 'border-green-500/60 bg-green-500/10'
                    : 'border-red-500/60 bg-red-500/10'
                }`}
              >
                <div
                  className={`w-[5px] h-[5px] rounded-full ${
                    step.state === 'pending'
                      ? 'bg-amber-400 animate-pulse'
                      : step.state === 'done'
                      ? 'bg-green-400'
                      : 'bg-red-400'
                  }`}
                />
              </div>

              {/* Step content */}
              <div className="flex flex-col gap-1 min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-mono text-foreground/70 leading-relaxed break-words">
                  &ldquo;{step.query}&rdquo;
                </p>
                {step.state === 'done' && step.results && (
                  <span className="text-[10px] font-mono text-muted-foreground/45">
                    {step.results.length} sources
                  </span>
                )}
                {step.state === 'error' && (
                  <span className="text-[10px] font-mono text-red-500/60">search failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
