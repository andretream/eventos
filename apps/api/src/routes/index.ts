import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { authRouter } from './auth.routes.js';
import { eventsRouter } from './event.routes.js';
import { usersRouter } from './user.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_, response) => {
  response.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', requireAuth, usersRouter);
apiRouter.use('/events', requireAuth, eventsRouter);
