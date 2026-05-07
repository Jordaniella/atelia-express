import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { generatedContentRouter } from '../modules/generated-contents/generated-content.routes.js';
import { generatedVisualRouter } from '../modules/generated-visuals/generated-visual.routes.js';
import { productRouter } from '../modules/products/product.routes.js';
import { projectRouter } from '../modules/projects/project.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'atelia-api' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/generated-contents', generatedContentRouter);
apiRouter.use('/generated-visuals', generatedVisualRouter);
