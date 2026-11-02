import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Server,
  Layers,
  Key,
  Code2,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import { systemService } from '../../services/api.ts';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schemas' | 'api' | 'deployment'>('architecture');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingStatus(true);
      systemService
        .getStatus()
        .then((res) => setSystemStatus(res))
        .catch((err) => console.error(err))
        .finally(() => setLoadingStatus(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">TaskFlow MERN Stack Specification</h2>
              <p className="text-xs text-slate-500">
                Full-Stack Architecture, Mongoose Schemas & REST API Documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Database Probe Banner */}
        <div className="bg-slate-900 text-slate-200 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Live Engine Status:</span>
            <span>
              {systemStatus?.database?.type === 'mongodb'
                ? `Connected to MongoDB Atlas (${systemStatus?.database?.databaseName})`
                : `Embedded MongoDB Engine Active (${systemStatus?.database?.databaseName || 'taskflow'})`}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Node: Express 4.x · MongoDB 7.x compatible · React 19
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-2">
          {[
            { id: 'architecture', label: '1. Architecture & Flow', icon: Layers },
            { id: 'schemas', label: '2. Mongoose Schemas', icon: Code2 },
            { id: 'api', label: '3. REST API Endpoints', icon: Server },
            { id: 'deployment', label: '4. Setup & Deployment', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">MERN Stack Anatomy</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  TaskFlow executes a clean four-tier separation of concerns with full type safety,
                  user-isolated task boundaries, and secure cryptographic password storage.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <span className="font-bold text-violet-700 block text-sm">M</span>
                    <strong className="block text-slate-800 mt-1">MongoDB</strong>
                    <span className="text-[11px] text-slate-500">Mongoose ODM + Atlas clustering</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <span className="font-bold text-violet-700 block text-sm">E</span>
                    <strong className="block text-slate-800 mt-1">Express.js</strong>
                    <span className="text-[11px] text-slate-500">REST API & JWT middleware</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <span className="font-bold text-violet-700 block text-sm">R</span>
                    <strong className="block text-slate-800 mt-1">React.js</strong>
                    <span className="text-[11px] text-slate-500">Tailwind + Axios + Context</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <span className="font-bold text-violet-700 block text-sm">N</span>
                    <strong className="block text-slate-800 mt-1">Node.js</strong>
                    <span className="text-[11px] text-slate-500">Runtime environment on port 3000</span>
                  </div>
                </div>
              </div>

              {/* Data Flow */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Request & Authorization Lifecycle</h4>
                <ol className="list-decimal pl-4 space-y-2 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Authentication Flow:</strong> Client requests <code>POST /api/auth/login</code> or <code>/register</code>. Passwords hashed with <code>bcryptjs</code> (10 salt rounds). Server signs a JWT with user <code>_id</code>.
                  </li>
                  <li>
                    <strong>Protected Queries:</strong> Axios automatically attaches <code>Authorization: Bearer &lt;token&gt;</code> via request interceptors.
                  </li>
                  <li>
                    <strong>Authorization Guard:</strong> Express <code>protect</code> middleware decodes JWT and binds verified user context to <code>req.user</code>.
                  </li>
                  <li>
                    <strong>User Isolation:</strong> Task controllers strictly query by <code>&#123; user: req.user._id &#125;</code>, preventing cross-tenant data leaks.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">User Schema (models/User.ts)</h3>
                <pre className="rounded-lg bg-slate-900 p-4 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'developer' }
  },
  { timestamps: true } // Auto generates createdAt & updatedAt
);

// Hash password with bcrypt before persistence
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Task Schema (models/Task.ts)</h3>
                <pre className="rounded-lg bg-slate-900 p-4 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`const TaskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Done'],
      default: 'Todo',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true
    },
    dueDate: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

// Compound indexing for rapid user-filtered queries
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">REST API Specification</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans text-xs">
                    <tr>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">Auth</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-600">POST</td>
                      <td className="py-2 px-3">/api/auth/register</td>
                      <td className="py-2 px-3 text-slate-400">Public</td>
                      <td className="py-2 px-3 font-sans">Register new account (name, email, password)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-600">POST</td>
                      <td className="py-2 px-3">/api/auth/login</td>
                      <td className="py-2 px-3 text-slate-400">Public</td>
                      <td className="py-2 px-3 font-sans">Authenticate & return JWT Bearer token</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-600">GET</td>
                      <td className="py-2 px-3">/api/auth/me</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Fetch active user profile session</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-amber-600">PUT</td>
                      <td className="py-2 px-3">/api/auth/profile</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Update profile details or change password</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-600">GET</td>
                      <td className="py-2 px-3">/api/tasks</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Get tasks with ?status=&priority=&search=&sortBy=</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-600">POST</td>
                      <td className="py-2 px-3">/api/tasks</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Create task (title, description, status, priority, dueDate)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-600">GET</td>
                      <td className="py-2 px-3">/api/tasks/:id</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Retrieve single task by ID</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-amber-600">PUT</td>
                      <td className="py-2 px-3">/api/tasks/:id</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Update task details or status</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-rose-600">DELETE</td>
                      <td className="py-2 px-3">/api/tasks/:id</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Delete task owned by user</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-600">GET</td>
                      <td className="py-2 px-3">/api/dashboard/stats</td>
                      <td className="py-2 px-3 text-violet-600 font-bold">JWT</td>
                      <td className="py-2 px-3 font-sans">Fetch completion rates, upcoming deadlines, priority radar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Installation & Deployment Guide</h3>

              <div className="space-y-2">
                <span className="font-semibold text-slate-800">1. Environment Variables (.env)</span>
                <pre className="rounded-lg bg-slate-900 p-3.5 text-slate-200 font-mono text-[11px] leading-relaxed">
{`PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-800">2. Build & Launch Commands</span>
                <pre className="rounded-lg bg-slate-900 p-3.5 text-slate-200 font-mono text-[11px] leading-relaxed">
{`# Install dependencies
npm install

# Build production bundle
npm run build

# Start full-stack Node server
npm start`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-800">3. Dockerfile Configuration</span>
                <pre className="rounded-lg bg-slate-900 p-3.5 text-slate-200 font-mono text-[11px] leading-relaxed">
{`FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            TaskFlow MERN Stack · Built for Production Portfolios
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
