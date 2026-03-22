import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projectService } from '../services/api';
import { format } from 'date-fns';

// Define types locally for now
interface Project {
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
  workItems?: any[];
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: 0,
    status: 'PLANNING'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projects = await projectService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách dự án' });
    }
  };

  const handleCreateProject = async () => {
    try {
      if (!newProject.name) {
        alert('Vui lòng nhập tên dự án');
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const createdProject = await projectService.create(newProject as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
      dispatch({ type: 'ADD_PROJECT', payload: createdProject });
      setOpenDialog(false);
      setNewProject({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: 0,
        status: 'PLANNING'
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tạo dự án mới' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'ON_HOLD': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Lên kế hoạch';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      case 'ON_HOLD': return 'Tạm dừng';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Quản lý Dự án
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Tạo dự án mới
        </Button>
      </Box>

      {state.loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {state.projects.map((project) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
            <Card
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 }
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" component="div">
                    {project.name}
                  </Typography>
                  <Chip
                    label={getStatusText(project.status || '')}
                    color={getStatusColor(project.status || '') as any}
                    size="small"
                  />
                </Box>
                
                <Typography color="text.secondary" paragraph>
                  {project.description || 'Không có mô tả'}
                </Typography>

                {project.budget && (
                  <Typography variant="body2" color="text.secondary">
                    Ngân sách: {formatCurrency(project.budget)}
                  </Typography>
                )}

                {project.start_date && (
                  <Typography variant="body2" color="text.secondary">
                    Bắt đầu: {format(new Date(project.start_date), 'dd/MM/yyyy')}
                  </Typography>
                )}

                {project.completionPercentage !== undefined && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Tiến độ: {project.completionPercentage.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.completionPercentage} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {state.projects.length === 0 && !state.loading && (
        <Box textAlign="center" mt={5}>
          <Typography variant="h6" color="text.secondary">
            Chưa có dự án nào
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2 }}
          >
            Tạo dự án đầu tiên
          </Button>
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo dự án mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên dự án"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ngày bắt đầu"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newProject.start_date}
            onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ngày kết thúc"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newProject.end_date}
            onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ngân sách (VND)"
            type="number"
            fullWidth
            variant="outlined"
            value={newProject.budget}
            onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleCreateProject} variant="contained">
            Tạo dự án
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;