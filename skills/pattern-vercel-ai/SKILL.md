---
name: pattern-vercel-ai
description: Vercel AI SDK patterns for streaming text, generating structured output, tool calls, and chat UIs. Activate when building AI features.
---

# Vercel AI SDK Patterns

## Installation

```bash
pnpm add ai @ai-sdk/openai
# or
pnpm add ai @ai-sdk/anthropic
```

## Chat: Route Handler + Client Hook

```typescript
// app/web/src/app/api/chat/route.ts (Server)
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}

// app/web/src/components/ChatUI.tsx (Client)
'use client';
import { useChat } from 'ai/react';

export function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn('p-3 rounded-lg', m.role === 'user' ? 'bg-primary text-primary-foreground ml-auto max-w-xs' : 'bg-muted max-w-xl')}>
            {m.content}
          </div>
        ))}
        {isLoading && <div className="text-muted-foreground">Thinking...</div>}
        {error && <div className="text-destructive">Error: {error.message}</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input value={input} onChange={handleInputChange} placeholder="Ask anything..." />
        <Button type="submit" disabled={isLoading}>Send</Button>
      </form>
    </div>
  );
}
```

## Structured Output with generateObject

```typescript
// Generate typed JSON from LLM
import { generateObject } from 'ai';
import { z } from 'zod';

const extractedSchema = z.object({
  title: z.string(),
  summary: z.string().max(200),
  tags: z.array(z.string()).max(5),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
});

export async function analyzeText(text: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: extractedSchema,
    prompt: `Analyze this text: ${text}`,
  });
  return object; // Fully typed as z.infer<typeof extractedSchema>
}
```

## Tool Calls

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: {
    getWeather: tool({
      description: 'Get the current weather for a city',
      parameters: z.object({
        city: z.string().describe('The city name'),
        unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
      }),
      execute: async ({ city, unit }) => {
        // Actual implementation
        const weather = await fetchWeatherAPI(city);
        return { temperature: weather.temp, condition: weather.condition };
      },
    }),
  },
});
```

## Embeddings for Semantic Search

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Single embedding
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'search query',
});

// Batch embeddings
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['doc 1', 'doc 2', 'doc 3'],
});
```

## Anti-Patterns

- API keys in client components
- No error handling for streaming failures
- Missing `maxDuration` on route handlers (default is 10s, too short for LLMs)
- Blocking the UI during generation (use streaming)
- Not debouncing auto-complete features
