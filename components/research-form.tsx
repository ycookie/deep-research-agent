'use client';

import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ResearchFormProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResearchForm({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ResearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <Textarea
          value={input}
          onChange={onInputChange}
          placeholder="What do you want to research? e.g. 'Impact of EV transition on tire market 2025–2030'"
          className="min-h-[110px] resize-none text-sm bg-card border-border/60 font-mono placeholder:text-muted-foreground/35 transition-colors duration-200 rounded-xl focus-visible:border-amber-500/50 focus-visible:ring-amber-500/10 pb-8"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/25 pointer-events-none font-mono select-none">
          ⌘↵
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/50 font-mono">
          {isLoading ? '● searching the web...' : 'up to 15 searches · AI synthesis'}
        </span>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-35 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all duration-200 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Researching
            </>
          ) : (
            <>
              Research
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
