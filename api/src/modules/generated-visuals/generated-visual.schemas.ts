import { z } from 'zod';

export const createGeneratedVisualSchema = z.object({
  productId: z.uuid(),
  imageUrl: z.url(),
  style: z.string().min(1).max(120),
  promptUsed: z.string().min(1).max(4000),
});

export const listGeneratedVisualsQuerySchema = z.object({
  productId: z.uuid(),
});

export type CreateGeneratedVisualInput = z.infer<typeof createGeneratedVisualSchema>;
export type ListGeneratedVisualsQuery = z.infer<typeof listGeneratedVisualsQuerySchema>;
