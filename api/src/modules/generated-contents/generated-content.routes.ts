import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import * as generatedContentController from './generated-content.controller.js';
import { createGeneratedContentSchema, listGeneratedContentsQuerySchema } from './generated-content.schemas.js';

export const generatedContentRouter = Router();

generatedContentRouter.use(requireAuth);
generatedContentRouter.post('/', validate({ body: createGeneratedContentSchema }), generatedContentController.createGeneratedContent);
generatedContentRouter.get('/', validate({ query: listGeneratedContentsQuerySchema }), generatedContentController.listGeneratedContents);
