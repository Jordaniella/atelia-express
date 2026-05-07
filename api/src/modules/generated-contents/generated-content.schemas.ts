import { z } from 'zod';

export const generatedContentTypeSchema = z.enum(['LANDING_PAGE', 'EMAIL', 'SOCIAL_POST', 'OFFER']);

export const createGeneratedContentSchema = z.object({
  productId: z.uuid(),
  type: generatedContentTypeSchema,
  title: z.string().max(160).optional(),
  content: z.string().min(1),
  promptUsed: z.string().max(4000).optional(),
});

export const listGeneratedContentsQuerySchema = z.object({
  productId: z.uuid(),
  type: generatedContentTypeSchema.optional(),
});

export type CreateGeneratedContentInput = z.infer<typeof createGeneratedContentSchema>;
export type ListGeneratedContentsQuery = z.infer<typeof listGeneratedContentsQuerySchema>;
