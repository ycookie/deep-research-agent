'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ResearchForm } from '@/components/research-form';
import { ResearchSteps } from '@/components/research-steps';
import { ResearchReport } from '@/components/research-report';
import { Separator } from '@/components/ui/separator';
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
  initialMessages: loadFromStorage(STORAGE_KEY),  // move it here
  transport: new DefaultChatTransport({ 
    api: '/api/chat'
  }),
});

  const isLoading = status === 'submitted' || status === 'streaming';
  const hasStarted = messages.length > 0;

  // Persist messages whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Persist last submitted query
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
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Deep Research Agent</h1>
            <p className="text-muted-foreground">
              Enter a topic and the agent will conduct multiple web searches to produce a
              comprehensive research report.
            </p>
          </div>
          {hasStarted && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear history
            </Button>
          )}
        </div>

        {/* Query form */}
        <ResearchForm
          input={input}
          isLoading={isLoading}
          onInputChange={(e) => setInput(e.target.value)}
          onSubmit={handleSubmit}
        />

        {(isLoading || hasStarted) && (
          <>
            <Separator />

            {/* Two-column layout: steps | report */}
            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
              <ResearchSteps messages={messages} isLoading={isLoading} />
              <ResearchReport messages={messages} isLoading={isLoading} query={submittedQuery} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
