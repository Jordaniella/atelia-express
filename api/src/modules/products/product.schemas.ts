import { z } from 'zod';

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const createProductSchema = z.object({
  projectId: z.uuid(),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price: z.string().max(120).optional(),
  targetSegment: z.string().max(1000).optional(),
  uniqueValueProposition: z.string().max(1000).optional(),
  status: productStatusSchema.optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  price: z.string().max(120).nullable().optional(),
  targetSegment: z.string().max(1000).nullable().optional(),
  uniqueValueProposition: z.string().max(1000).nullable().optional(),
  status: productStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
