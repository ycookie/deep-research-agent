'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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
      <Textarea
        value={input}
        onChange={onInputChange}
        placeholder="Enter a research topic, e.g. 'Impact of EV transition on tire market 2025–2030'"
        className="min-h-[100px] resize-none text-base"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="self-end gap-2"
        size="lg"
      >
        <Search className="h-4 w-4" />
        {isLoading ? 'Researching…' : 'Start Research'}
      </Button>
    </form>
  );
}
