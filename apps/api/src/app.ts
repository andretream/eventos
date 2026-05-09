import express from 'express';
import cors from 'cors';

import { apiRouter } from './routes/index.js';
import { env } from './utils/env.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api', apiRouter);

app.use((error: unknown, _: express.Request, response: express.Response, __: express.NextFunction) => {
  console.error(error);
  return response.status(500).json({ message: 'Erro interno do servidor.' });
});
