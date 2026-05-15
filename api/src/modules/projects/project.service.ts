import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { notFound } from '../../utils/app-error.js';
import type { CreateProjectInput, UpdateProjectInput } from './project.schemas.js';

const projectInclude = {
  brief: true,
  products: true,
} satisfies Prisma.ProjectInclude;

export function createProject(userId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      status: input.status,
      brief: input.brief ? { create: input.brief } : undefined,
    },
    include: projectInclude,
  });
}

export function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      brief: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      brief: true,
      products: {
        include: {
          _count: {
            select: { generatedContents: true, generatedVisuals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw notFound('Project');
  }

  return project;
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
  await assertProjectOwnership(userId, projectId);

  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      brief: input.brief
        ? {
            upsert: {
              create: {
                targetAudience: input.brief.targetAudience ?? 'Not specified yet',
                brandTone: input.brief.brandTone,
                marketContext: input.brief.marketContext,
                launchGoal: input.brief.launchGoal,
                keyMessage: input.brief.keyMessage,
                offerDescription: input.brief.offerDescription,
                competitors: input.brief.competitors,
              },
              update: input.brief,
            },
          }
        : undefined,
    },
    include: projectInclude,
  });
}

export async function deleteProject(userId: string, projectId: string) {
  await assertProjectOwnership(userId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
}

export async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    throw notFound('Project');
  }

  return project;
}
