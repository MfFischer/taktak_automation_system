/**
 * Centralized API client
 * Handles all HTTP requests to the backend
 */

import { config } from '../config/environment';

const API_BASE_URL = config.apiUrl;

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Makes an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?error=session_expired';
      }
    }

    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

/**
 * API client methods
 */
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requiresAuth: false,
      }),

    signup: (email: string, password: string, name: string) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        requiresAuth: false,
      }),

    logout: () =>
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
  },

  // Workflows
  workflows: {
    list: (params?: { status?: string; tags?: string[]; limit?: number; skip?: number }) =>
      apiRequest(`/api/workflows${params ? `?${new URLSearchParams(params as any)}` : ''}`),

    get: (id: string) =>
      apiRequest(`/api/workflows/${id}`),

    create: (workflow: any) =>
      apiRequest('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      }),

    update: (id: string, workflow: any) =>
      apiRequest(`/api/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(workflow),
      }),

    delete: (id: string) =>
      apiRequest(`/api/workflows/${id}`, {
        method: 'DELETE',
      }),

    execute: (id: string, input?: any) =>
      apiRequest(`/api/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ input }),
      }),
  },

  // Executions
  executions: {
    list: (params?: { workflowId?: string; status?: string; limit?: number; skip?: number }) =>
      apiRequest(`/api/executions${params ? `?${new URLSearchParams(params as any)}` : ''}`),

    get: (id: string) =>
      apiRequest(`/api/executions/${id}`),
  },

  // AI
  ai: {
    interpret: (prompt: string, dryRun = false) =>
      apiRequest('/api/ai/interpret', {
        method: 'POST',
        body: JSON.stringify({ prompt, dryRun }),
      }),

    validate: (workflow: any) =>
      apiRequest('/api/ai/validate', {
        method: 'POST',
        body: JSON.stringify({ workflow }),
      }),

    suggestions: (workflowId: string) =>
      apiRequest(`/api/ai/suggestions/${workflowId}`),

    getMode: () => apiRequest('/api/ai/mode', { method: 'GET' }),

    setMode: (mode: 'cloud' | 'local' | 'auto') =>
      apiRequest('/api/ai/mode', {
        method: 'POST',
        body: JSON.stringify({ mode }),
      }),
  },

  // Settings
  settings: {
    get: () =>
      apiRequest('/api/settings'),

    update: (settings: any) =>
      apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),

    setApiKey: (service: string, apiKey: string) =>
      apiRequest('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ service, apiKey }),
      }),
  },

  // Health
  health: () =>
    apiRequest('/api/health', { requiresAuth: false }),

  // Templates
  templates: {
    getAll: (params?: {
      category?: string;
      difficulty?: string;
      tags?: string;
      search?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params?.tags) queryParams.append('tags', params.tags);
      if (params?.search) queryParams.append('search', params.search);

      const query = queryParams.toString();
      return apiRequest(`/api/templates${query ? `?${query}` : ''}`);
    },

    getCategories: () => apiRequest('/api/templates/categories'),

    getById: (id: string) => apiRequest(`/api/templates/${id}`),

    import: (id: string, customName?: string, customDescription?: string) =>
      apiRequest(`/api/templates/${id}/import`, {
        method: 'POST',
        body: JSON.stringify({ customName, customDescription }),
      }),
  },

  // License API
  license: {
    validate: (licenseKey: string) =>
      apiRequest('/api/license/validate', {
        method: 'POST',
        body: JSON.stringify({ licenseKey }),
        requiresAuth: false,
      }),

    activate: (licenseKey: string, deviceId?: string) =>
      apiRequest('/api/license/activate', {
        method: 'POST',
        body: JSON.stringify({ licenseKey, deviceId }),
      }),

    create: (data: {
      tier: string;
      email: string;
      expiresInDays?: number;
      metadata?: any;
    }) =>
      apiRequest('/api/license/create', {
        method: 'POST',
        body: JSON.stringify(data),
        requiresAuth: false,
      }),

    getMyLicenses: () => apiRequest('/api/license/my-licenses'),

    deactivate: (licenseKey: string) =>
      apiRequest('/api/license/deactivate', {
        method: 'POST',
        body: JSON.stringify({ licenseKey }),
        requiresAuth: false,
      }),

    generateDeviceId: (machineInfo: {
      platform: string;
      arch: string;
      hostname?: string;
      macAddress?: string;
    }) =>
      apiRequest('/api/license/device-id', {
        method: 'POST',
        body: JSON.stringify(machineInfo),
        requiresAuth: false,
      }),
  },
};

export default api;
