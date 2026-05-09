import type { Request, Response } from 'express';

import { z } from 'zod';

import { prisma } from '../utils/prisma.js';

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
}).refine((data) => data.endsAt > data.startsAt, {
  message: 'A data final deve ser posterior a inicial.',
  path: ['endsAt']
});

const eventSelect = {
  id: true,
  title: true,
  description: true,
  location: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} as const;

export async function listEvents(_: Request, response: Response) {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: 'asc' },
    select: eventSelect
  });

  return response.json(events);
}

export async function createEvent(request: Request, response: Response) {
  const parsed = eventSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Dados invalidos.', issues: parsed.error.flatten() });
  }

  const createdById = request.auth?.userId;

  if (!createdById) {
    return response.status(401).json({ message: 'Nao autenticado.' });
  }

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      createdById,
      description: parsed.data.description || null,
      location: parsed.data.location || null
    },
    select: eventSelect
  });

  return response.status(201).json(event);
}

export async function updateEvent(request: Request, response: Response) {
  const parsed = eventSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Dados invalidos.', issues: parsed.error.flatten() });
  }

  const eventId = request.params.id;
  const eventExists = await prisma.event.findUnique({ where: { id: eventId } });

  if (!eventExists) {
    return response.status(404).json({ message: 'Evento nao encontrado.' });
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt
    },
    select: eventSelect
  });

  return response.json(event);
}

export async function deleteEvent(request: Request, response: Response) {
  const eventId = request.params.id;
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    return response.status(404).json({ message: 'Evento nao encontrado.' });
  }

  await prisma.event.delete({ where: { id: eventId } });

  return response.status(204).send();
}
