'use client';

import { UIMessage, isToolUIPart, DynamicToolUIPart } from 'ai';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

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

      // Both typed ToolUIPart ('tool-search') and DynamicToolUIPart ('dynamic-tool')
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

  if (steps.length === 0) {
    if (!isLoading) return null;
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Research Steps
        </h2>
        <Card className="border-border/60">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <Loader2 className="h-4 w-4 shrink-0 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Preparing searches…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Research Steps
      </h2>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="py-3 px-4 flex items-start gap-3">
              {step.state === 'pending' ? (
                <Loader2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-500 animate-spin" />
              ) : step.state === 'error' ? (
                <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {step.state === 'pending' ? 'Searching:' : 'Searched:'}{' '}
                  <span className="text-foreground/80">&ldquo;{step.query}&rdquo;</span>
                </p>
                {step.state === 'done' && step.results && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    {step.results.length} result{step.results.length !== 1 ? 's' : ''} found
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
