import type { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../utils/prisma.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const;

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF)
});

const updateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.nativeEnum(UserRole)
});

export async function listUsers(_: Request, response: Response) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: publicUserSelect
  });

  return response.json(users);
}

export async function createUser(request: Request, response: Response) {
  const parsed = createUserSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Dados invalidos.', issues: parsed.error.flatten() });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existingUser) {
    return response.status(409).json({ message: 'Ja existe um usuario com este email.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role
    },
    select: publicUserSelect
  });

  return response.status(201).json(user);
}

export async function updateUser(request: Request, response: Response) {
  const parsed = updateUserSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Dados invalidos.', issues: parsed.error.flatten() });
  }

  const userId = request.params.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return response.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  const emailOwner = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (emailOwner && emailOwner.id !== userId) {
    return response.status(409).json({ message: 'Ja existe um usuario com este email.' });
  }

  const userUpdated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) } : {})
    },
    select: publicUserSelect
  });

  return response.json(userUpdated);
}

export async function deleteUser(request: Request, response: Response) {
  const userId = request.params.id;
  const authUserId = request.auth?.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return response.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  if (userId === authUserId) {
    return response.status(400).json({ message: 'Voce nao pode excluir o proprio usuario logado.' });
  }

  const eventsCount = await prisma.event.count({ where: { createdById: userId } });

  if (eventsCount > 0) {
    return response.status(400).json({ message: 'Nao e possivel excluir usuario com eventos vinculados.' });
  }

  await prisma.user.delete({ where: { id: userId } });

  return response.status(204).send();
}
