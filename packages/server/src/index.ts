import express from 'express';
import type { ApiResponse } from '@flaschenkarten/shared';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  const response: ApiResponse<{ status: string }> = {
    data: { status: 'ok' },
  };
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
