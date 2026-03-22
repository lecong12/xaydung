import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { Project, ProjectStatus } from '@prisma/client';

// Helper to map camelCase Prisma result to snake_case for frontend compatibility
const mapProjectResponse = (project: any) => ({
  ...project,
  start_date: project.startDate,
  end_date: project.endDate,
  created_at: project.createdAt,
  updated_at: project.updatedAt,
});

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        workItems: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats in JS since Mongo aggregation is complex in simple find
    const projectsWithProgress = projects.map((project: any) => {
      const totalDesign = project.workItems.reduce((sum: number, item: any) => sum + item.designQuantity, 0);
      const totalCompleted = project.workItems.reduce((sum: number, item: any) => sum + item.completedQuantity, 0);
      const completionPercentage = totalDesign > 0 
        ? (totalCompleted / totalDesign) * 100 
        : 0;

      // Format snake_case for compatibility
      const mapped = mapProjectResponse(project);
      return {
        ...mapped,
        work_item_count: project.workItems.length,
        total_design_quantity: totalDesign,
        total_completed_quantity: totalCompleted,
        completionPercentage: Math.round(completionPercentage * 100) / 100
      };
    });

    res.json(projectsWithProgress);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, budget, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        status: status as ProjectStatus || ProjectStatus.PLANNING,
      }
    });
    
    res.status(201).json(mapProjectResponse(project));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { workItems: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalDesignQuantity = project.workItems.reduce((sum: number, item: any) => sum + item.designQuantity, 0);
    const totalCompletedQuantity = project.workItems.reduce((sum: number, item: any) => sum + item.completedQuantity, 0);
    const completionPercentage = totalDesignQuantity > 0 ? (totalCompletedQuantity / totalDesignQuantity) * 100 : 0;

    const mappedProject = mapProjectResponse(project);
    const projectWithDetails = {
      ...mappedProject,
      // Map work items to snake_case too
      workItems: project.workItems.map((w: any) => ({ ...w, start_date: w.startDate, end_date: w.endDate })),
      completionPercentage: Math.round(completionPercentage * 100) / 100
    };

    res.json(projectWithDetails);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, budget, status } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        // Handle undefined vs null carefully
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        ...(status !== undefined && { status: status as ProjectStatus }),
      }
    });

    res.json(mapProjectResponse(updatedProject));
  } catch (error) {
    console.error('Error updating project:', error);
    // Prisma error P2025 means record not found
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Get work items for project
export const getProjectWorkItems = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const workItems = await prisma.workItem.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(workItems.map(w => ({ ...w, start_date: w.startDate, end_date: w.endDate })));
  } catch (error) {
    console.error('Error fetching work items:', error);
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
};

// Create work item for project
export const createProjectWorkItem = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, unit, designQuantity, unitPrice, startDate, endDate } = req.body;

    if (!name || !unit || designQuantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ 
        error: 'Name, unit, design quantity, and unit price are required' 
      });
    }

    const workItem = await prisma.workItem.create({
      data: {
        projectId,
        name,
        description,
        unit,
        designQuantity: parseFloat(designQuantity),
        unitPrice: parseFloat(unitPrice),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    res.status(201).json({ ...workItem, start_date: workItem.startDate, end_date: workItem.endDate });
  } catch (error) {
    console.error('Error creating work item:', error);
    res.status(500).json({ error: 'Failed to create work item' });
  }
};