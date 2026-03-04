'use client';

import { useState } from 'react';
import { UIMessage, isTextUIPart } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col gap-2 h-full flex-1 min-w-0">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Research Report
      </h2>
      <Card className="flex-1 border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base min-w-0">
              <FileText className="h-4 w-4 shrink-0" />
              Report
              {query && (
                <span className="text-sm font-normal text-muted-foreground ml-2 truncate">
                  — {query}
                </span>
              )}
              {isLoading && content.length === 0 && (
                <span className="text-xs text-muted-foreground font-normal animate-pulse shrink-0">
                  Generating…
                </span>
              )}
            </CardTitle>
            {content && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleCopy}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleExport}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ScrollArea className="h-[500px] pr-3">
            {isLoading && !content ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/5" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ) : content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
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
              <p className="text-sm text-muted-foreground italic">
                The report will appear here once research is complete…
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
