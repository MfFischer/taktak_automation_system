/**
 * Shared TypeScript types for Taktak platform
 * @module @taktak/types
 */

// ============================================
// User & Subscription Types
// ============================================

export enum UserTier {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export interface UsageStats {
  executionsThisMonth: number;
  executionsLastReset: string;
  activeWorkflows: number;
}

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
  ERROR_TRIGGER = 'error_trigger', // NEW: Triggered when errors occur

  // Actions
  SEND_SMS = 'send_sms',
  SEND_EMAIL = 'send_email',
  DATABASE_QUERY = 'database_query',
  DATABASE_INSERT = 'database_insert',
  DATABASE_UPDATE = 'database_update',
  HTTP_REQUEST = 'http_request',

  // Integrations - Communication
  SLACK = 'slack',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  TWILIO = 'twilio',

  // Integrations - Google Workspace
  GOOGLE_SHEETS = 'google_sheets',
  GOOGLE_DRIVE = 'google_drive',
  GOOGLE_CALENDAR = 'google_calendar',
  GMAIL = 'gmail',

  // Integrations - Development
  GITHUB = 'github',
  GITLAB = 'gitlab',

  // Integrations - Payments
  STRIPE = 'stripe',
  PAYPAL = 'paypal',

  // Integrations - Productivity
  NOTION = 'notion',
  AIRTABLE = 'airtable',
  TRELLO = 'trello',
  ASANA = 'asana',

  // Integrations - AI
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',

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
  // Enhanced execution configuration
  executionConfig?: NodeExecutionConfig;
}

export interface NodeExecutionConfig {
  retries?: number; // Number of retry attempts (default: 0)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  timeout?: number; // Execution timeout in ms (default: 30000)
  continueOnError?: boolean; // Continue workflow even if this node fails (default: false)
  parallel?: boolean; // Can be executed in parallel with siblings (default: false)
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
  userId?: string; // User who owns this workflow
  tags?: string[];
  metadata?: Record<string, unknown>;
  version?: number; // Current version number
}

// ============================================
// Workflow Versioning Types
// ============================================

export interface WorkflowVersion {
  _id: string;
  _rev?: string;
  type: 'workflow_version';
  workflowId: string;
  version: number;
  snapshot: Workflow; // Complete workflow snapshot at this version
  createdAt: string;
  createdBy?: string;
  changeDescription?: string; // Optional description of what changed
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

export interface LoopNodeConfig {
  items: string | unknown[]; // Array to iterate over or expression like "{{$json.items}}"
  batchSize?: number; // Process items in batches (default: 1)
  maxIterations?: number; // Safety limit (default: 1000)
  continueOnItemError?: boolean; // Continue loop even if an item fails (default: false)
}

export interface ErrorTriggerNodeConfig {
  triggerOnNodes?: string[]; // Specific node IDs to watch (empty = all nodes)
  errorTypes?: string[]; // Specific error types to catch (empty = all errors)
  notifyEmail?: string; // Optional email notification
  notifySMS?: string; // Optional SMS notification
}

export interface SlackNodeConfig {
  action: 'send_message' | 'create_channel' | 'update_status' | 'upload_file';
  token: string; // Slack Bot Token

  // For send_message
  channel?: string;
  text?: string;
  blocks?: unknown[];
  threadTs?: string;

  // For create_channel
  channelName?: string;
  isPrivate?: boolean;

  // For update_status
  statusText?: string;
  statusEmoji?: string;

  // For upload_file
  file?: string | Buffer;
  filename?: string;
  channels?: string[];
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

export enum TemplateCategory {
  CLINIC = 'clinic',
  STORE = 'store',
  COOPERATIVE = 'cooperative',
  GROCERY = 'grocery',
  PRINTSHOP = 'printshop',
  PHARMACY = 'pharmacy',
  GENERAL = 'general',
}

export enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  icon?: string;
  estimatedSetupTime: number; // in minutes
  requiredIntegrations: string[]; // e.g., ['twilio', 'smtp']
  workflow: Omit<Workflow, '_id' | '_rev' | 'createdAt' | 'updatedAt'>;
  useCases: string[];
  benefits: string[];
  createdAt: string;
  updatedAt: string;
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


// Google Sheets Node Configuration
export interface GoogleSheetsNodeConfig {
  action: 'read' | 'write' | 'append' | 'update' | 'clear';
  apiKey?: string;
  accessToken?: string;
  spreadsheetId: string;
  sheetName?: string;
  range?: string;
  values?: unknown[][];
  valueInputOption?: 'RAW' | 'USER_ENTERED';
}

// Stripe Node Configuration
export interface StripeNodeConfig {
  action: 'create_payment_intent' | 'create_customer' | 'create_subscription' | 'refund_payment' | 'get_payment';
  apiKey: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  email?: string;
  name?: string;
  paymentIntentId?: string;
  priceId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

// GitHub Node Configuration
export interface GitHubNodeConfig {
  action: 'create_issue' | 'create_pr' | 'get_repo' | 'list_issues' | 'add_comment' | 'merge_pr';
  token: string;
  owner: string;
  repo: string;
  title?: string;
  body?: string;
  issueNumber?: number;
  prNumber?: number;
  head?: string;
  base?: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
}

// Discord Node Configuration
export interface DiscordNodeConfig {
  action: 'send_message' | 'send_webhook' | 'send_embed';
  token?: string;
  channelId?: string;
  content?: string;
  webhookUrl?: string;
  username?: string;
  avatarUrl?: string;
  embed?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  };
}
