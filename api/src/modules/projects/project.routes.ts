import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../shared.schemas.js';
import * as projectController from './project.controller.js';
import { createProjectSchema, updateProjectSchema } from './project.schemas.js';

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.post('/', validate({ body: createProjectSchema }), projectController.createProject);
projectRouter.get('/', projectController.listProjects);
projectRouter.get('/:id', validate({ params: idParamSchema }), projectController.getProject);
projectRouter.patch('/:id', validate({ params: idParamSchema, body: updateProjectSchema }), projectController.updateProject);
projectRouter.delete('/:id', validate({ params: idParamSchema }), projectController.deleteProject);
