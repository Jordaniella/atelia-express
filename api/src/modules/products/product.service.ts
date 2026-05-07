import { prisma } from '../../config/prisma.js';
import { notFound } from '../../utils/app-error.js';
import { assertProjectOwnership } from '../projects/project.service.js';
import type { CreateProductInput, UpdateProductInput } from './product.schemas.js';

export async function createProduct(userId: string, input: CreateProductInput) {
  await assertProjectOwnership(userId, input.projectId);

  return prisma.product.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      price: input.price,
      targetSegment: input.targetSegment,
      uniqueValueProposition: input.uniqueValueProposition,
      status: input.status,
    },
  });
}

export async function getProduct(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, project: { userId } },
    include: {
      project: { select: { id: true, name: true } },
      generatedContents: { orderBy: { createdAt: 'desc' } },
      generatedVisuals: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product) {
    throw notFound('Product');
  }

  return product;
}

export async function updateProduct(userId: string, productId: string, input: UpdateProductInput) {
  await assertProductOwnership(userId, productId);

  return prisma.product.update({
    where: { id: productId },
    data: input,
  });
}

export async function deleteProduct(userId: string, productId: string) {
  await assertProductOwnership(userId, productId);
  await prisma.product.delete({ where: { id: productId } });
}

export async function assertProductOwnership(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, project: { userId } },
    select: { id: true },
  });

  if (!product) {
    throw notFound('Product');
  }

  return product;
}
