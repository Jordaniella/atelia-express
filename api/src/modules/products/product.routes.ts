import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../shared.schemas.js';
import * as productController from './product.controller.js';
import { createProductSchema, updateProductSchema } from './product.schemas.js';

export const productRouter = Router();

productRouter.use(requireAuth);
productRouter.post('/', validate({ body: createProductSchema }), productController.createProduct);
productRouter.get('/:id', validate({ params: idParamSchema }), productController.getProduct);
productRouter.patch('/:id', validate({ params: idParamSchema, body: updateProductSchema }), productController.updateProduct);
productRouter.delete('/:id', validate({ params: idParamSchema }), productController.deleteProduct);
