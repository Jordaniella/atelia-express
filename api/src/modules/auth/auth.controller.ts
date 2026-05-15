import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/http.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res: Response) => {
  const result = await authService.register(req.body);
  return res.status(201).json(result);
});

export const login = asyncHandler(async (req, res: Response) => {
  const result = await authService.login(req.body);
  return res.status(200).json(result);
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ user: req.user });
});
