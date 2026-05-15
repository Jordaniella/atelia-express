import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/http.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as generatedContentService from './generated-content.service.js';

export const createGeneratedContent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const generatedContent = await generatedContentService.createGeneratedContent(req.user.id, req.body);
  return res.status(201).json({ generatedContent });
});

export const listGeneratedContents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const generatedContents = await generatedContentService.listGeneratedContents(req.user.id, req.query as any);
  return res.status(200).json({ generatedContents });
});
