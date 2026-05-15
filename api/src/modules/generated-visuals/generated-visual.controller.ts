import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/http.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as generatedVisualService from './generated-visual.service.js';

export const createGeneratedVisual = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const generatedVisual = await generatedVisualService.createGeneratedVisual(req.user.id, req.body);
  return res.status(201).json({ generatedVisual });
});

export const listGeneratedVisuals = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const generatedVisuals = await generatedVisualService.listGeneratedVisuals(req.user.id, req.query as any);
  return res.status(200).json({ generatedVisuals });
});
