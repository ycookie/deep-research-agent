'use client';

import { useState } from 'react';
import { UIMessage, isTextUIPart } from 'ai';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Check } from 'lucide-react';

interface ResearchReportProps {
  messages: UIMessage[];
  isLoading: boolean;
  query?: string;
}

function stripPreamble(text: string): string {
  const match = text.match(/(^|\n)(#+ )/);
  if (!match || match.index === undefined) return text;
  return text.slice(match.index).trimStart();
}

function extractReportContent(messages: UIMessage[]): string {
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  if (assistantMessages.length === 0) return '';

  const last = assistantMessages[assistantMessages.length - 1];
  const raw = last.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join('');
  return stripPreamble(raw);
}

export function ResearchReport({ messages, isLoading, query }: ResearchReportProps) {
  const [copied, setCopied] = useState(false);
  const content = extractReportContent(messages);

  if (!content && !isLoading) return null;

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${query ? query.slice(0, 40).replace(/[^a-z0-9]+/gi, '-') : 'research-report'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.15em]">
          Research Report
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        {/* Report toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-muted/10">
          <div className="flex items-center gap-3 min-w-0">
            {query && (
              <span className="text-xs font-mono text-muted-foreground/60 truncate max-w-[280px]">
                {query}
              </span>
            )}
            {isLoading && !content && (
              <span className="text-xs font-mono text-amber-500/60 animate-pulse">
                ● generating...
              </span>
            )}
            {isLoading && content && (
              <span className="text-xs font-mono text-amber-500/60 animate-pulse">
                ● streaming
              </span>
            )}
          </div>
          {content && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
              >
                <Download className="h-3 w-3" />
                Export
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[560px]">
          <div className="px-6 py-6">
            {isLoading && !content ? (
              <div className="space-y-3">
                {[0.75, 1, 0.88, 0.6, 1, 0.82, 0.7, 0.95, 0.5].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 bg-muted/30 rounded animate-pulse"
                    style={{ width: `${w * 100}%`, animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            ) : content ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-display prose-headings:font-semibold prose-headings:text-foreground
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-0
                  prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                  prose-p:text-foreground/75 prose-p:leading-relaxed
                  prose-li:text-foreground/75
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-code:font-mono prose-code:text-amber-400/80 prose-code:bg-muted/30 prose-code:rounded prose-code:px-1 prose-code:text-[0.8em]
                  prose-blockquote:border-l-amber-500/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic"
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400/80 hover:text-amber-400 underline decoration-amber-400/25 hover:decoration-amber-400/50 transition-colors break-all"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm font-mono text-muted-foreground/35 italic">
                Report will appear here once research is complete…
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
