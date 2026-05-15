import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/http.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as projectService from './project.service.js';

export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await projectService.createProject(req.user.id, req.body);
  return res.status(201).json({ project });
});

export const listProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projects = await projectService.listProjects(req.user.id);
  return res.status(200).json({ projects });
});

export const getProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await projectService.getProject(req.user.id, req.params.id);
  return res.status(200).json({ project });
});

export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
  return res.status(200).json({ project });
});

export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await projectService.deleteProject(req.user.id, req.params.id);
  return res.status(204).send();
});
