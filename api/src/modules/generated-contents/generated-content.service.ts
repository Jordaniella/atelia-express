import { prisma } from '../../config/prisma.js';
import { assertProductOwnership } from '../products/product.service.js';
import type { CreateGeneratedContentInput, ListGeneratedContentsQuery } from './generated-content.schemas.js';

export async function createGeneratedContent(userId: string, input: CreateGeneratedContentInput) {
  await assertProductOwnership(userId, input.productId);

  return prisma.generatedContent.create({
    data: {
      productId: input.productId,
      type: input.type,
      title: input.title,
      content: input.content,
      promptUsed: input.promptUsed,
    },
  });
}

export async function listGeneratedContents(userId: string, query: ListGeneratedContentsQuery) {
  await assertProductOwnership(userId, query.productId);

  return prisma.generatedContent.findMany({
    where: {
      productId: query.productId,
      type: query.type,
    },
    orderBy: { createdAt: 'desc' },
  });
}
