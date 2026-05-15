import { z } from 'zod';

export const projectStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const briefSchema = z.object({
  targetAudience: z.string().min(2).max(1000),
  brandTone: z.string().max(200).optional(),
  marketContext: z.string().max(2000).optional(),
  launchGoal: z.string().max(1000).optional(),
  keyMessage: z.string().max(1000).optional(),
  offerDescription: z.string().max(2000).optional(),
  competitors: z.string().max(2000).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  status: projectStatusSchema.optional(),
  brief: briefSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: projectStatusSchema.optional(),
  brief: briefSchema.partial().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
