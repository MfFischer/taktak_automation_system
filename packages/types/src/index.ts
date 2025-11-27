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
  ERROR_TRIGGER = 'error_trigger',

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

  // E-commerce (Planned)
  POS_SHOPIFY = 'pos_shopify',
  POS_SQUARE = 'pos_square',
  SYNC_CLOUD = 'sync_cloud',
}

// ============================================
// Node Metadata System (Single Source of Truth)
// ============================================

/**
 * Defines whether a node is a trigger, action, or logic node
 */
export type NodeKind = 'trigger' | 'action' | 'logic' | 'data' | 'integration';

/**
 * Node category for organizing in the palette
 */
export type NodeCategory =
  | 'triggers'
  | 'actions'
  | 'data'
  | 'logic'
  | 'communication'
  | 'google_workspace'
  | 'development'
  | 'payments'
  | 'productivity'
  | 'ai'
  | 'ecommerce';

/**
 * Implementation status of a node
 */
export type NodeStatus = 'stable' | 'beta' | 'planned';

/**
 * Metadata for a single node type - single source of truth
 */
export interface NodeMetadata {
  type: NodeType;
  label: string;
  description: string;
  category: NodeCategory;
  kind: NodeKind;
  icon: string; // Icon name (lucide icon key)
  color: string; // Tailwind color class
  backendImplemented: boolean;
  frontendImplemented: boolean;
  status: NodeStatus;
  documentationUrl?: string;
  requiredCredentials?: string[];
  actions?: string[]; // Available actions for integration nodes
}

/**
 * Complete node registry - single source of truth for all nodes
 * This is used by both frontend and backend
 */
export const NODE_REGISTRY: Record<NodeType, NodeMetadata> = {
  // ============ TRIGGERS ============
  [NodeType.SCHEDULE]: {
    type: NodeType.SCHEDULE,
    label: 'Schedule',
    description: 'Run workflow on a schedule (cron, interval, daily, weekly)',
    category: 'triggers',
    kind: 'trigger',
    icon: 'Clock',
    color: 'blue',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.WEBHOOK]: {
    type: NodeType.WEBHOOK,
    label: 'Webhook',
    description: 'Trigger workflow via HTTP request',
    category: 'triggers',
    kind: 'trigger',
    icon: 'Webhook',
    color: 'purple',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.DATABASE_WATCH]: {
    type: NodeType.DATABASE_WATCH,
    label: 'Database Watch',
    description: 'Watch for database changes and trigger workflow',
    category: 'triggers',
    kind: 'trigger',
    icon: 'Eye',
    color: 'orange',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.ERROR_TRIGGER]: {
    type: NodeType.ERROR_TRIGGER,
    label: 'Error Trigger',
    description: 'Handle errors from other nodes in the workflow',
    category: 'triggers',
    kind: 'trigger',
    icon: 'AlertTriangle',
    color: 'red',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },

  // ============ ACTIONS ============
  [NodeType.SEND_SMS]: {
    type: NodeType.SEND_SMS,
    label: 'Send SMS',
    description: 'Send SMS messages via Twilio',
    category: 'actions',
    kind: 'action',
    icon: 'Phone',
    color: 'green',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['twilio'],
  },
  [NodeType.SEND_EMAIL]: {
    type: NodeType.SEND_EMAIL,
    label: 'Send Email',
    description: 'Send emails via SMTP',
    category: 'actions',
    kind: 'action',
    icon: 'Mail',
    color: 'blue',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['smtp'],
  },
  [NodeType.HTTP_REQUEST]: {
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description: 'Make HTTP requests to any API',
    category: 'actions',
    kind: 'action',
    icon: 'Globe',
    color: 'indigo',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },

  // ============ DATA ============
  [NodeType.DATABASE_QUERY]: {
    type: NodeType.DATABASE_QUERY,
    label: 'Database Query',
    description: 'Query data from database',
    category: 'data',
    kind: 'data',
    icon: 'Search',
    color: 'cyan',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.DATABASE_INSERT]: {
    type: NodeType.DATABASE_INSERT,
    label: 'Database Insert',
    description: 'Insert records into database',
    category: 'data',
    kind: 'data',
    icon: 'Database',
    color: 'cyan',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.DATABASE_UPDATE]: {
    type: NodeType.DATABASE_UPDATE,
    label: 'Database Update',
    description: 'Update records in database',
    category: 'data',
    kind: 'data',
    icon: 'Edit',
    color: 'cyan',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.CSV_IMPORT]: {
    type: NodeType.CSV_IMPORT,
    label: 'CSV Import',
    description: 'Import data from CSV files',
    category: 'data',
    kind: 'data',
    icon: 'FileText',
    color: 'emerald',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.CSV_EXPORT]: {
    type: NodeType.CSV_EXPORT,
    label: 'CSV Export',
    description: 'Export data to CSV format',
    category: 'data',
    kind: 'data',
    icon: 'FileText',
    color: 'emerald',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.TRANSFORM]: {
    type: NodeType.TRANSFORM,
    label: 'Transform Data',
    description: 'Transform and manipulate data',
    category: 'data',
    kind: 'data',
    icon: 'RefreshCw',
    color: 'violet',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },

  // ============ LOGIC ============
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    label: 'Condition',
    description: 'Branch workflow based on conditions',
    category: 'logic',
    kind: 'logic',
    icon: 'GitBranch',
    color: 'yellow',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.LOOP]: {
    type: NodeType.LOOP,
    label: 'Loop',
    description: 'Iterate over items in a collection',
    category: 'logic',
    kind: 'logic',
    icon: 'Repeat',
    color: 'yellow',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.DELAY]: {
    type: NodeType.DELAY,
    label: 'Delay',
    description: 'Wait for a specified duration',
    category: 'logic',
    kind: 'logic',
    icon: 'Timer',
    color: 'yellow',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },

  // ============ COMMUNICATION ============
  [NodeType.SLACK]: {
    type: NodeType.SLACK,
    label: 'Slack',
    description: 'Send messages, create channels, upload files',
    category: 'communication',
    kind: 'integration',
    icon: 'Slack',
    color: 'purple',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['slack'],
    actions: ['send_message', 'create_channel', 'update_status', 'upload_file'],
  },
  [NodeType.DISCORD]: {
    type: NodeType.DISCORD,
    label: 'Discord',
    description: 'Send messages and embeds to Discord',
    category: 'communication',
    kind: 'integration',
    icon: 'MessageSquare',
    color: 'indigo',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['discord'],
    actions: ['send_message', 'send_webhook', 'send_embed'],
  },
  [NodeType.TELEGRAM]: {
    type: NodeType.TELEGRAM,
    label: 'Telegram',
    description: 'Send messages via Telegram bot',
    category: 'communication',
    kind: 'integration',
    icon: 'Send',
    color: 'sky',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['telegram'],
    actions: ['send_message', 'send_photo', 'send_document'],
  },
  [NodeType.TWILIO]: {
    type: NodeType.TWILIO,
    label: 'Twilio',
    description: 'SMS and voice communications',
    category: 'communication',
    kind: 'integration',
    icon: 'Phone',
    color: 'red',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['twilio'],
    actions: ['send_sms', 'make_call', 'send_whatsapp'],
  },

  // ============ GOOGLE WORKSPACE ============
  [NodeType.GOOGLE_SHEETS]: {
    type: NodeType.GOOGLE_SHEETS,
    label: 'Google Sheets',
    description: 'Read, write, and manage spreadsheets',
    category: 'google_workspace',
    kind: 'integration',
    icon: 'Sheet',
    color: 'green',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['google'],
    actions: ['read', 'write', 'append', 'update', 'clear'],
  },
  [NodeType.GOOGLE_DRIVE]: {
    type: NodeType.GOOGLE_DRIVE,
    label: 'Google Drive',
    description: 'Upload, download, and manage files',
    category: 'google_workspace',
    kind: 'integration',
    icon: 'FolderOpen',
    color: 'yellow',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['google'],
    actions: ['upload', 'download', 'list', 'delete', 'create_folder', 'share'],
  },
  [NodeType.GOOGLE_CALENDAR]: {
    type: NodeType.GOOGLE_CALENDAR,
    label: 'Google Calendar',
    description: 'Create and manage calendar events',
    category: 'google_workspace',
    kind: 'integration',
    icon: 'Calendar',
    color: 'blue',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['google'],
    actions: ['create_event', 'update_event', 'delete_event', 'list_events', 'get_event'],
  },
  [NodeType.GMAIL]: {
    type: NodeType.GMAIL,
    label: 'Gmail',
    description: 'Send and manage emails via Gmail',
    category: 'google_workspace',
    kind: 'integration',
    icon: 'Mail',
    color: 'red',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['google'],
    actions: ['send', 'read', 'search', 'delete', 'add_label'],
  },

  // ============ DEVELOPMENT ============
  [NodeType.GITHUB]: {
    type: NodeType.GITHUB,
    label: 'GitHub',
    description: 'Manage issues, PRs, and repositories',
    category: 'development',
    kind: 'integration',
    icon: 'Github',
    color: 'gray',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['github'],
    actions: ['create_issue', 'create_pr', 'get_repo', 'list_issues', 'add_comment', 'merge_pr'],
  },
  [NodeType.GITLAB]: {
    type: NodeType.GITLAB,
    label: 'GitLab',
    description: 'Manage issues, MRs, and projects',
    category: 'development',
    kind: 'integration',
    icon: 'GitMerge',
    color: 'orange',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['gitlab'],
    actions: ['create_issue', 'create_mr', 'get_project', 'list_issues', 'add_comment', 'merge_mr'],
  },

  // ============ PAYMENTS ============
  [NodeType.STRIPE]: {
    type: NodeType.STRIPE,
    label: 'Stripe',
    description: 'Process payments and manage customers',
    category: 'payments',
    kind: 'integration',
    icon: 'CreditCard',
    color: 'purple',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['stripe'],
    actions: ['create_payment_intent', 'create_customer', 'create_subscription', 'refund_payment', 'get_payment'],
  },
  [NodeType.PAYPAL]: {
    type: NodeType.PAYPAL,
    label: 'PayPal',
    description: 'Process PayPal payments',
    category: 'payments',
    kind: 'integration',
    icon: 'DollarSign',
    color: 'blue',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['paypal'],
    actions: ['create_order', 'capture_order', 'refund', 'get_order'],
  },

  // ============ PRODUCTIVITY ============
  [NodeType.NOTION]: {
    type: NodeType.NOTION,
    label: 'Notion',
    description: 'Manage pages and databases in Notion',
    category: 'productivity',
    kind: 'integration',
    icon: 'BookOpen',
    color: 'gray',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['notion'],
    actions: ['create_page', 'update_page', 'query_database', 'create_database', 'append_block'],
  },
  [NodeType.AIRTABLE]: {
    type: NodeType.AIRTABLE,
    label: 'Airtable',
    description: 'Manage records in Airtable bases',
    category: 'productivity',
    kind: 'integration',
    icon: 'Table2',
    color: 'teal',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['airtable'],
    actions: ['list_records', 'get_record', 'create_record', 'update_record', 'delete_record'],
  },
  [NodeType.TRELLO]: {
    type: NodeType.TRELLO,
    label: 'Trello',
    description: 'Manage boards, lists, and cards',
    category: 'productivity',
    kind: 'integration',
    icon: 'Trello',
    color: 'blue',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['trello'],
    actions: ['create_card', 'update_card', 'move_card', 'add_comment', 'create_list'],
  },
  [NodeType.ASANA]: {
    type: NodeType.ASANA,
    label: 'Asana',
    description: 'Manage tasks and projects in Asana',
    category: 'productivity',
    kind: 'integration',
    icon: 'ListChecks',
    color: 'pink',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['asana'],
    actions: ['create_task', 'update_task', 'complete_task', 'create_project', 'add_comment'],
  },

  // ============ AI ============
  [NodeType.AI_GENERATE]: {
    type: NodeType.AI_GENERATE,
    label: 'AI Generate',
    description: 'Generate text using AI (multi-provider)',
    category: 'ai',
    kind: 'action',
    icon: 'Sparkles',
    color: 'violet',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
  },
  [NodeType.AI_PARSE]: {
    type: NodeType.AI_PARSE,
    label: 'AI Parse',
    description: 'Parse and extract structured data using AI',
    category: 'ai',
    kind: 'action',
    icon: 'Brain',
    color: 'violet',
    backendImplemented: false,
    frontendImplemented: true,
    status: 'beta',
  },
  [NodeType.OPENAI]: {
    type: NodeType.OPENAI,
    label: 'OpenAI',
    description: 'Use OpenAI GPT models directly',
    category: 'ai',
    kind: 'integration',
    icon: 'Bot',
    color: 'emerald',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['openai'],
    actions: ['chat', 'complete', 'embed', 'image_generate'],
  },
  [NodeType.ANTHROPIC]: {
    type: NodeType.ANTHROPIC,
    label: 'Anthropic',
    description: 'Use Anthropic Claude models directly',
    category: 'ai',
    kind: 'integration',
    icon: 'Bot',
    color: 'amber',
    backendImplemented: true,
    frontendImplemented: true,
    status: 'stable',
    requiredCredentials: ['anthropic'],
    actions: ['chat', 'complete'],
  },

  // ============ E-COMMERCE (PLANNED) ============
  [NodeType.POS_SHOPIFY]: {
    type: NodeType.POS_SHOPIFY,
    label: 'Shopify',
    description: 'Manage Shopify store, orders, and products',
    category: 'ecommerce',
    kind: 'integration',
    icon: 'ShoppingCart',
    color: 'green',
    backendImplemented: false,
    frontendImplemented: true,
    status: 'planned',
    requiredCredentials: ['shopify'],
    actions: ['list_orders', 'create_product', 'update_inventory', 'fulfill_order'],
  },
  [NodeType.POS_SQUARE]: {
    type: NodeType.POS_SQUARE,
    label: 'Square',
    description: 'Manage Square POS, payments, and catalog',
    category: 'ecommerce',
    kind: 'integration',
    icon: 'Store',
    color: 'gray',
    backendImplemented: false,
    frontendImplemented: true,
    status: 'planned',
    requiredCredentials: ['square'],
    actions: ['list_payments', 'create_order', 'update_inventory', 'create_customer'],
  },
  [NodeType.SYNC_CLOUD]: {
    type: NodeType.SYNC_CLOUD,
    label: 'Cloud Sync',
    description: 'Sync data to cloud storage services',
    category: 'ecommerce',
    kind: 'action',
    icon: 'Cloud',
    color: 'sky',
    backendImplemented: false,
    frontendImplemented: true,
    status: 'planned',
  },
};

/**
 * Category metadata for organizing the node palette
 */
export interface CategoryMetadata {
  id: NodeCategory;
  label: string;
  description: string;
  order: number;
}

export const CATEGORY_REGISTRY: CategoryMetadata[] = [
  { id: 'triggers', label: 'Triggers', description: 'Start your workflow', order: 1 },
  { id: 'actions', label: 'Actions', description: 'Core actions', order: 2 },
  { id: 'data', label: 'Data', description: 'Data operations', order: 3 },
  { id: 'logic', label: 'Logic', description: 'Control flow', order: 4 },
  { id: 'communication', label: 'Communication', description: 'Messaging integrations', order: 5 },
  { id: 'google_workspace', label: 'Google Workspace', description: 'Google services', order: 6 },
  { id: 'development', label: 'Development', description: 'Dev tools', order: 7 },
  { id: 'payments', label: 'Payments', description: 'Payment processing', order: 8 },
  { id: 'productivity', label: 'Productivity', description: 'Productivity tools', order: 9 },
  { id: 'ai', label: 'AI', description: 'AI & ML', order: 10 },
  { id: 'ecommerce', label: 'E-commerce', description: 'Online stores', order: 11 },
];

/**
 * Helper functions for working with node registry
 */
export function getNodesByCategory(category: NodeCategory): NodeMetadata[] {
  return Object.values(NODE_REGISTRY).filter((node) => node.category === category);
}

export function getImplementedNodes(): NodeMetadata[] {
  return Object.values(NODE_REGISTRY).filter((node) => node.backendImplemented && node.frontendImplemented);
}

export function getPlannedNodes(): NodeMetadata[] {
  return Object.values(NODE_REGISTRY).filter((node) => node.status === 'planned');
}

export function isNodeImplemented(type: NodeType): boolean {
  const meta = NODE_REGISTRY[type];
  return meta?.backendImplemented && meta?.frontendImplemented;
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
