import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { searchWeb } from '@/lib/exa';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const SYSTEM = `You are a thorough deep-research agent.
Given a topic, run at least 4-6 web searches using the search tool, then write a comprehensive Markdown research report.

STRICT OUTPUT RULES:
- Do NOT write any preamble, thinking text, or narrate your search plan
- Start your response DIRECTLY with the report title as a # heading
- Use ## section headers, bullet points, and **bold** key terms throughout
- Cite sources inline as Markdown links using the real URLs from search results: [Source Title](https://actual-url.com)
- Every factual claim should have at least one inline citation link`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openrouter('google/gemini-2.0-flash-lite', {
      maxTokens: 8000,
    }),
    system: SYSTEM,
    messages: modelMessages,
    tools: {
      search: tool({
        description: 'Search the web for information on a topic.',
        inputSchema: z.object({
          query: z.string().describe('The search query to run'),
        }),
        execute: async (input) => searchWeb(input.query),
      }),
    },
    stopWhen: stepCountIs(15),
    providerOptions: {
      openrouter: {
        max_tokens: 8000,
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
