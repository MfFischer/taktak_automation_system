/**
 * Shared TypeScript types for Taktak platform
 * @module @taktak/types
 */

// ============================================
// Workflow Types
// ============================================

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

export enum NodeType {
  // Triggers
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
  DATABASE_WATCH = 'database_watch',
  
  // Actions
  SEND_SMS = 'send_sms',
  SEND_EMAIL = 'send_email',
  DATABASE_QUERY = 'database_query',
  DATABASE_INSERT = 'database_insert',
  DATABASE_UPDATE = 'database_update',
  HTTP_REQUEST = 'http_request',
  
  // Logic
  CONDITION = 'condition',
  LOOP = 'loop',
  DELAY = 'delay',
  
  // Data
  TRANSFORM = 'transform',
  CSV_IMPORT = 'csv_import',
  CSV_EXPORT = 'csv_export',
  
  // AI
  AI_GENERATE = 'ai_generate',
  AI_PARSE = 'ai_parse',
  
  // Integrations
  POS_SHOPIFY = 'pos_shopify',
  POS_SQUARE = 'pos_square',
  SYNC_CLOUD = 'sync_cloud',
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowConnection {
  from: string; // node id
  to: string; // node id
  condition?: string; // for conditional branches
}

export interface Workflow {
  _id: string;
  _rev?: string;
  type: 'workflow';
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  trigger: WorkflowNode;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================
// Execution Types
// ============================================

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  data?: unknown;
}

export interface WorkflowExecution {
  _id: string;
  _rev?: string;
  type: 'execution';
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number; // milliseconds
  logs: ExecutionLog[];
  error?: {
    message: string;
    stack?: string;
    nodeId?: string;
  };
  result?: unknown;
  metadata?: Record<string, unknown>;
}

// ============================================
// Configuration Types
// ============================================

export interface ApiKeyConfig {
  id: string;
  name: string;
  service: 'gemini' | 'twilio' | 'smtp' | 'shopify' | 'square' | 'custom';
  encryptedKey: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
}

export interface SyncConfig {
  enabled: boolean;
  couchdbUrl?: string;
  username?: string;
  encryptedPassword?: string;
  database: string;
  autoSync: boolean;
  syncInterval?: number; // minutes
  lastSync?: string;
}

export interface AppSettings {
  _id: 'settings';
  _rev?: string;
  type: 'settings';
  sync: SyncConfig;
  apiKeys: ApiKeyConfig[];
  features: {
    aiEnabled: boolean;
    cloudSyncEnabled: boolean;
    analyticsEnabled: boolean;
  };
  security: {
    encryptionEnabled: boolean;
    sessionTimeout: number; // minutes
  };
  notifications: {
    email: boolean;
    desktop: boolean;
  };
  updatedAt: string;
}

// ============================================
// Node Configuration Types
// ============================================

export interface ScheduleNodeConfig {
  cron: string;
  timezone?: string;
  enabled: boolean;
}

export interface WebhookNodeConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };
}

export interface SMSNodeConfig {
  to: string; // can be template: {{phone}}
  message: string; // can be template
  provider: 'twilio';
  from?: string;
}

export interface EmailNodeConfig {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  html?: boolean;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string;
  }>;
}

export interface ConditionNodeConfig {
  conditions: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
    value: unknown;
  }>;
  logic: 'and' | 'or';
}

export interface DatabaseQueryConfig {
  collection: string;
  operation: 'find' | 'findOne' | 'count';
  query: Record<string, unknown>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface AIGenerateConfig {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// User Types
// ============================================

export interface User {
  _id: string;
  _rev?: string;
  type: 'user';
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  preferences?: Record<string, unknown>;
}

// ============================================
// Template Types
// ============================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'grocery' | 'clinic' | 'printshop' | 'pharmacy' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workflow: Omit<Workflow, '_id' | '_rev' | 'createdAt' | 'updatedAt'>;
  requiredIntegrations: string[];
  estimatedSetupTime: number; // minutes
  tags: string[];
}

// ============================================
// Audit Types
// ============================================

export interface AuditLog {
  _id: string;
  _rev?: string;
  type: 'audit';
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  timestamp: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

