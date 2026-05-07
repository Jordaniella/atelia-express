import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import * as generatedVisualController from './generated-visual.controller.js';
import { createGeneratedVisualSchema, listGeneratedVisualsQuerySchema } from './generated-visual.schemas.js';

export const generatedVisualRouter = Router();

generatedVisualRouter.use(requireAuth);
generatedVisualRouter.post('/', validate({ body: createGeneratedVisualSchema }), generatedVisualController.createGeneratedVisual);
generatedVisualRouter.get('/', validate({ query: listGeneratedVisualsQuerySchema }), generatedVisualController.listGeneratedVisuals);
