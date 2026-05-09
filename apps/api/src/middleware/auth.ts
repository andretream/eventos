import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils/jwt.js';

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Nao autenticado.' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    request.auth = verifyToken(token);
    return next();
  } catch {
    return response.status(401).json({ message: 'Token invalido ou expirado.' });
  }
}
