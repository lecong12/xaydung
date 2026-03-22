import { Request, Response } from 'express';
import { prisma } from '../utils/database';

// Helper to map camelCase Prisma result to snake_case for frontend compatibility
const mapWorkItemResponse = (item: any) => ({
  ...item,
  start_date: item.startDate,
  end_date: item.endDate,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

// Get all work items (optional, usually fetched via Project)
export const getAllWorkItems = async (req: Request, res: Response) => {
  try {
    const workItems = await prisma.workItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(workItems.map(mapWorkItemResponse));
  } catch (error) {
    console.error('Error fetching work items:', error);
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
};

// Get single work item by ID
export const getWorkItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workItem = await prisma.workItem.findUnique({
      where: { id }
    });

    if (!workItem) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    res.json(mapWorkItemResponse(workItem));
  } catch (error) {
    console.error('Error fetching work item:', error);
    res.status(500).json({ error: 'Failed to fetch work item' });
  }
};

// Update work item
export const updateWorkItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, description, unit, designQuantity, 
      completedQuantity, unitPrice, startDate, endDate, status 
    } = req.body;

    const updatedWorkItem = await prisma.workItem.update({
      where: { id },
      data: {
        name,
        description,
        unit,
        ...(designQuantity !== undefined && { designQuantity: parseFloat(designQuantity) }),
        ...(completedQuantity !== undefined && { completedQuantity: parseFloat(completedQuantity) }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        status
      }
    });

    res.json(mapWorkItemResponse(updatedWorkItem));
  } catch (error) {
    console.error('Error updating work item:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Work item not found' });
    }
    res.status(500).json({ error: 'Failed to update work item' });
  }
};

// Delete work item
export const deleteWorkItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.workItem.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work item:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Work item not found' });
    }
    res.status(500).json({ error: 'Failed to delete work item' });
  }
};