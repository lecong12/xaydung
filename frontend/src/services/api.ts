// API service for projects
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface Project {
  id?: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  completionPercentage?: number;
  workItems?: WorkItem[];
}

export interface WorkItem {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  unit: string;
  design_quantity: number;
  completed_quantity?: number;
  unit_price: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Project API functions
export const projectService = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  // Update project
  update: async (id: string, project: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Get work items for project
  getWorkItems: async (projectId: string): Promise<WorkItem[]> => {
    const response = await api.get(`/projects/${projectId}/work-items`);
    return response.data;
  },

  // Create work item for project
  createWorkItem: async (projectId: string, workItem: Omit<WorkItem, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<WorkItem> => {
    const response = await api.post(`/projects/${projectId}/work-items`, workItem);
    return response.data;
  }
};

export default api;