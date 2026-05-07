import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);
authRouter.get('/me', requireAuth, authController.me);
