import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { unauthorized } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(unauthorized('Missing Bearer token'));
  }

  const token = authorization.replace('Bearer ', '').trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return next(unauthorized('Invalid token user'));
    }

    req.user = user;
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}
