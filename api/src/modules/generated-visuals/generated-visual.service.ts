import { prisma } from '../../config/prisma.js';
import { assertProductOwnership } from '../products/product.service.js';
import type { CreateGeneratedVisualInput, ListGeneratedVisualsQuery } from './generated-visual.schemas.js';

export async function createGeneratedVisual(userId: string, input: CreateGeneratedVisualInput) {
  await assertProductOwnership(userId, input.productId);

  return prisma.generatedVisual.create({
    data: {
      productId: input.productId,
      imageUrl: input.imageUrl,
      style: input.style,
      promptUsed: input.promptUsed,
    },
  });
}

export async function listGeneratedVisuals(userId: string, query: ListGeneratedVisualsQuery) {
  await assertProductOwnership(userId, query.productId);

  return prisma.generatedVisual.findMany({
    where: { productId: query.productId },
    orderBy: { createdAt: 'desc' },
  });
}
