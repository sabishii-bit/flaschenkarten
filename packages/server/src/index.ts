import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ApiResponse } from '@flaschenkarten/shared';

const app = new Hono();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? '*',
}));

app.get('/api/health', (c) => {
  const response: ApiResponse<{ status: string }> = {
    data: { status: 'ok' },
  };
  return c.json(response);
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
