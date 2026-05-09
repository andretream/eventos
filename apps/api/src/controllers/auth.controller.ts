import type { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const;

export async function login(request: Request, response: Response) {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Dados de login invalidos.', issues: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      ...publicUserSelect,
      passwordHash: true
    }
  });

  if (!user) {
    return response.status(401).json({ message: 'Credenciais invalidas.' });
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ message: 'Credenciais invalidas.' });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  const { passwordHash, ...safeUser } = user;

  return response.json({ token, user: safeUser });
}

export async function me(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    return response.status(401).json({ message: 'Nao autenticado.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: publicUserSelect
  });

  if (!user) {
    return response.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  return response.json(user);
}
