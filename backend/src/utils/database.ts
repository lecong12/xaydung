// Using Prisma Client as an adapter for SQLite operations to ensure Vercel compatibility
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initializeDatabase = async () => {
  // Execute table creation queries individually to ensure compatibility
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      budget REAL,
      status TEXT DEFAULT 'PLANNING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS work_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT NOT NULL,
      design_quantity REAL NOT NULL,
      completed_quantity REAL DEFAULT 0,
      unit_price REAL NOT NULL,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'NOT_STARTED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT,
      unit_price REAL,
      stock_quantity REAL DEFAULT 0,
      minimum_stock REAL DEFAULT 0,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      model TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      daily_rate REAL,
      last_maintenance DATE,
      next_maintenance DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      employee_code TEXT UNIQUE,
      name TEXT NOT NULL,
      position TEXT,
      skill_level INTEGER,
      hourly_rate REAL,
      daily_rate REAL,
      phone TEXT,
      address TEXT,
      hire_date DATE,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return prisma;
};

export const getDatabase = () => {
  // Return an object that mimics the 'sqlite' library interface used in controllers
  return {
    all: async (sql: string, params: any[] = []) => {
      return await prisma.$queryRawUnsafe(sql, ...params);
    },
    get: async (sql: string, params: any[] = []) => {
      const result: any[] = await prisma.$queryRawUnsafe(sql, ...params);
      return result[0] || undefined;
    },
    run: async (sql: string, params: any[] = []) => {
      const result = await prisma.$executeRawUnsafe(sql, ...params);
      // Return structure compatible with sqlite driver result ({ changes: number })
      return { changes: result };
    }
  };
};