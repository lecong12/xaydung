import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/database';

// Import routes
import projectRoutes from './routes/projects';
import workItemRoutes from './routes/workItems';
import materialRoutes from './routes/materials';
import equipmentRoutes from './routes/equipment';
import workerRoutes from './routes/workers';
import reportRoutes from './routes/reports';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Database
let dbInitialized = false;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/work-items', workItemRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }
    res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', timestamp: new Date().toISOString(), error: 'Database connection failed' });
  }
});

// Root route handler
app.get('/', (req, res) => {
  res.json({ 
    message: 'Construction Management API is running', 
    docs: '/api/health' 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    dbInitialized = true;
    console.log('📚 Database initialized successfully');
    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;