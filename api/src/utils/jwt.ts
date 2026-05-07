import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface JwtPayload {
  userId: string;
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
