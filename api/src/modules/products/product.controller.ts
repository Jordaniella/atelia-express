import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/http.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as productService from './product.service.js';

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productService.createProduct(req.user.id, req.body);
  return res.status(201).json({ product });
});

export const getProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productService.getProduct(req.user.id, req.params.id);
  return res.status(200).json({ product });
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productService.updateProduct(req.user.id, req.params.id, req.body);
  return res.status(200).json({ product });
});

export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await productService.deleteProduct(req.user.id, req.params.id);
  return res.status(204).send();
});
