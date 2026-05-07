import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const projectIdParamSchema = z.object({
  projectId: z.uuid(),
});

export const productIdParamSchema = z.object({
  productId: z.uuid(),
});

export const contentIdParamSchema = z.object({
  contentId: z.uuid(),
});

export const visualIdParamSchema = z.object({
  visualId: z.uuid(),
});
