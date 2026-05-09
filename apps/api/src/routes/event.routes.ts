import { Router } from 'express';

import { createEvent, deleteEvent, listEvents, updateEvent } from '../controllers/events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', listEvents);
eventsRouter.post('/', createEvent);
eventsRouter.put('/:id', updateEvent);
eventsRouter.delete('/:id', deleteEvent);
