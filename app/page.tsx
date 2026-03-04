'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ResearchForm } from '@/components/research-form';
import { ResearchSteps } from '@/components/research-steps';
import { ResearchReport } from '@/components/research-report';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const STORAGE_KEY = 'research-messages';
const QUERY_KEY = 'research-last-query';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function ResearchPage() {
  const [input, setInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(
    () => loadFromStorage<string>(QUERY_KEY, '')
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/research'
    }),
  });

  useEffect(() => {
    const saved = loadFromStorage(STORAGE_KEY, []);
    if (saved?.length) {
      setMessages(saved);
    }
  }, []);

  const isLoading = status === 'submitted' || status === 'streaming';
  const hasStarted = messages.length > 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(QUERY_KEY, submittedQuery);
  }, [submittedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setSubmittedQuery(input.trim());
    sendMessage({ text: input });
    setInput('');
  };

  const handleClear = () => {
    setMessages([]);
    setSubmittedQuery('');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUERY_KEY);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[5%] w-[700px] h-[500px] bg-amber-500/[0.04] blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[0%] w-[500px] h-[400px] bg-blue-600/[0.03] blur-[130px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="absolute w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-25" />
            </div>
            <span className="font-display text-base font-semibold tracking-wide text-foreground/90">
              Deep Research Agent
            </span>
          </div>
          {hasStarted && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive font-mono text-xs gap-1.5 h-8"
              onClick={handleClear}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </header>

        {/* Hero — only shown before first research */}
        {!hasStarted && !isLoading && (
          <div
            className="text-center pt-8 pb-2 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <h1 className="font-display text-5xl font-bold text-foreground leading-tight mb-4">
              Research anything,{' '}
              <span className="text-amber-400">deeply.</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
              Multi-step web research with AI synthesis. The agent searches, reads, and writes a comprehensive report.
            </p>
          </div>
        )}

        {/* Query form */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: hasStarted ? '0s' : '0.2s' }}
        >
          <ResearchForm
            input={input}
            isLoading={isLoading}
            onInputChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Results */}
        {(isLoading || hasStarted) && (
          <div className="flex flex-col lg:flex-row items-start gap-8 w-full animate-fade-in-up">
            <ResearchSteps messages={messages} isLoading={isLoading} />
            <ResearchReport messages={messages} isLoading={isLoading} query={submittedQuery} />
          </div>
        )}
      </div>
    </main>
  );
}
