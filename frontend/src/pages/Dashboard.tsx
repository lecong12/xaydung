import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
} from '@mui/material';
import {
  Business as ProjectIcon,
  Work as WorkIcon,
  People as WorkerIcon,
  Assessment as ProgressIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Mock data for demo
  const stats = [
    {
      title: 'Tổng số dự án',
      value: '12',
      icon: <ProjectIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Hạng mục công việc',
      value: '48',
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: 'Nhân công',
      value: '156',
      icon: <WorkerIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
    },
    {
      title: 'Tiến độ trung bình',
      value: '68%',
      icon: <ProgressIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tổng quan hệ thống quản lý dự án xây dựng
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid dContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ color: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Pax{pography variant="h6" gutterBottom>
             ngypography>
            <Typography color="text.secondary">
              Chưa có dữ liệu
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            yah6" gutterBottom>
              Hoạt động gần đây
            yrxt.secondary">
              Chưa có dữ liệu
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;