import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface DatabaseStatus {
  connected: boolean;
  type: 'mongodb' | 'embedded';
  uri: string;
  databaseName: string;
  error?: string;
}

export let dbStatus: DatabaseStatus = {
  connected: false,
  type: 'embedded',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow',
  databaseName: 'taskflow',
};

// Embedded Fallback Store for reliable operation when external mongod is offline
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'taskflow-db.json');

export interface MemoryRecord {
  _id: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

interface MemoryStoreSchema {
  users: MemoryRecord[];
  tasks: MemoryRecord[];
}

let memoryDb: MemoryStoreSchema = {
  users: [],
  tasks: [],
};

// Load or seed persistent local JSON storage
export function loadEmbeddedDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
    } else {
      seedInitialData();
      saveEmbeddedDb();
    }
  } catch (err) {
    console.warn('[TaskFlow DB] Warning reading embedded DB file, using clean state:', err);
    seedInitialData();
  }
}

export function saveEmbeddedDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TaskFlow DB] Error writing embedded DB file:', err);
  }
}

export function getMemoryDb(): MemoryStoreSchema {
  return memoryDb;
}

// Seed realistic demo user and tasks
function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);
  const demoUserId = '65b1c9a01f4c3a2b1098abcd';

  memoryDb.users = [
    {
      _id: demoUserId,
      name: 'Alex Morgan',
      email: 'alex@taskflow.dev',
      password: hashedPassword,
      avatar: '/src/assets/images/avatar_alex_morgan_1793612521566.jpg',
      role: 'Senior Full Stack Engineer',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ];

  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  memoryDb.tasks = [
    {
      _id: '65b1c9a01f4c3a2b1098e001',
      user: demoUserId,
      title: 'Architect JWT Authentication and Refresh Middleware',
      description: 'Implement token signing with 24-hour expiration, Bearer extraction, and role authorization guard for Express routes.',
      status: 'Done',
      priority: 'High',
      dueDate: new Date(now - day * 2).toISOString(),
      createdAt: new Date(now - day * 8).toISOString(),
      updatedAt: new Date(now - day * 2).toISOString(),
    },
    {
      _id: '65b1c9a01f4c3a2b1098e002',
      user: demoUserId,
      title: 'Design TaskFlow SaaS Responsive Dashboard',
      description: 'Build metric statistics cards with completion rate gauge, upcoming deadline counter, and quick action buttons.',
      status: 'Done',
      priority: 'Medium',
      dueDate: new Date(now - day * 1).toISOString(),
      createdAt: new Date(now - day * 6).toISOString(),
      updatedAt: new Date(now - day * 1).toISOString(),
    },
    {
      _id: '65b1c9a01f4c3a2b1098e003',
      user: demoUserId,
      title: 'Optimize MongoDB Compound Indexing on User and DueDate',
      description: 'Add compound indices { user: 1, status: 1 } and { user: 1, dueDate: 1 } to accelerate high-volume query execution.',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date(now + day * 1).toISOString(),
      createdAt: new Date(now - day * 4).toISOString(),
      updatedAt: new Date(now - day * 1).toISOString(),
    },
    {
      _id: '65b1c9a01f4c3a2b1098e004',
      user: demoUserId,
      title: 'Implement Multi-Criteria Filter and Search Pipeline',
      description: 'Support real-time text matching on task titles and descriptions with priority segmentation and status tab counters.',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: new Date(now + day * 3).toISOString(),
      createdAt: new Date(now - day * 3).toISOString(),
      updatedAt: new Date(now - day * 1).toISOString(),
    },
    {
      _id: '65b1c9a01f4c3a2b1098e005',
      user: demoUserId,
      title: 'Conduct Automated Cross-Browser and WCAG Accessibility Audit',
      description: 'Verify 4.5:1 text contrast ratios, visible keyboard focus indicators, and screen reader labels for dialog modals.',
      status: 'Todo',
      priority: 'Medium',
      dueDate: new Date(now + day * 5).toISOString(),
      createdAt: new Date(now - day * 2).toISOString(),
      updatedAt: new Date(now - day * 2).toISOString(),
    },
    {
      _id: '65b1c9a01f4c3a2b1098e006',
      user: demoUserId,
      title: 'Prepare Docker Compose and Production Deployment Manifests',
      description: 'Configure multi-stage container build with node:22-alpine, env secrets injection, and healthcheck probe endpoints.',
      status: 'Todo',
      priority: 'Low',
      dueDate: new Date(now + day * 7).toISOString(),
      createdAt: new Date(now - day * 1).toISOString(),
      updatedAt: new Date(now - day * 1).toISOString(),
    },
  ];
}

// Connect Database with graceful fallback
export const connectDB = async (): Promise<DatabaseStatus> => {
  loadEmbeddedDb();

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
  const mongoTimeoutMs = 1500;

  try {
    console.log(`[TaskFlow DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: mongoTimeoutMs,
      connectTimeoutMS: mongoTimeoutMs,
    });

    dbStatus = {
      connected: true,
      type: 'mongodb',
      uri,
      databaseName: mongoose.connection.name || 'taskflow',
    };
    console.log(`[TaskFlow DB] Successfully connected to MongoDB database: ${dbStatus.databaseName}`);
    return dbStatus;
  } catch (err: any) {
    dbStatus = {
      connected: true,
      type: 'embedded',
      uri: 'Embedded Document Engine (JSON persistent)',
      databaseName: 'taskflow_embedded',
      error: `MongoDB server at ${uri} was unreachable (${err.message || 'connection timeout'}). Switched to high-performance Embedded MongoDB Engine with file persistence.`,
    };
    console.log(`[TaskFlow DB] ${dbStatus.error}`);
    return dbStatus;
  }
};
