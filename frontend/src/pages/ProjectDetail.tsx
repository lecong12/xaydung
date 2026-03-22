import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { projectService } from '../services/api';

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
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projectData = await projectService.getById(projectId);
      setProject(projectData);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: projectData });
      
      // Load work items
      const workItems = await projectService.getWorkItems(projectId);
      dispatch({ type: 'SET_WORK_ITEMS', payload: workItems });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải thông tin dự án' });
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

  if (!project) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4">
          {project.name}
        </Typography>
        <Chip
          label={getStatusText(project.status || '')}
          color={getStatusColor(project.status || '') as any}
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Project Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin dự án
              </Typography>
              <Typography paragraph>
                {project.description || 'Không có mô tả'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày bắt đầu
                  </Typography>
                  <Typography>
                    {project.start_date ? format(new Date(project.start_date), 'dd/MM/yyyy') : 'Chưa xác định'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày kết thúc
                  </Typography>
                  <Typography>
                    {project.end_date ? format(new Date(project.end_date), 'dd/MM/yyyy') : 'Chưa xác định'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngân sách
                  </Typography>
                  <Typography>
                    {project.budget ? formatCurrency(project.budget) : 'Chưa xác định'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số hạng mục
                  </Typography>
                  <Typography>
                    {state.workItems.length} hạng mục
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tiến độ tổng thể
              </Typography>
              <Box textAlign="center">
                <Typography variant="h3" color="primary">
                  {project.completionPercentage?.toFixed(1) || 0}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={project.completionPercentage || 0}
                  sx={{ mt: 2, height: 8, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Hoàn thành
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Hạng mục công việc" />
            <Tab label="Nhân công" />
            <Tab label="Vật tư" />
            <Tab label="Thiết bị" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Danh sách hạng mục công việc
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Thêm hạng mục
            </Button>
          </Box>
          
          {state.workItems.length > 0 ? (
            <List>
              {state.workItems.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {item.description || 'Không có mô tả'}
                        </Typography>
                        <Typography variant="body2">
                          Khối lượng: {item.completed_quantity || 0}/{item.design_quantity} {item.unit}
                        </Typography>
                        <Typography variant="body2">
                          Đơn giá: {formatCurrency(item.unit_price)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(item.completed_quantity || 0) / item.design_quantity * 100}
                          sx={{ mt: 1, width: 200 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              Chưa có hạng mục công việc nào
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Quản lý nhân công
          </Typography>
          <Typography color="text.secondary">
            Chức năng đang phát triển
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Quản lý vật tư
          </Typography>
          <Typography color="text.secondary">
            Chức năng đang phát triển
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Quản lý thiết bị
          </Typography>
          <Typography color="text.secondary">
            Chức năng đang phát triển
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProjectDetail;