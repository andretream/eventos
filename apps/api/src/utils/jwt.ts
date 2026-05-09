import jwt from 'jsonwebtoken';

import { env } from './env.js';

type AuthPayload = {
  userId: string;
  email: string;
  role: string;
};

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
}
