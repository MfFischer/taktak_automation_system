/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.ENCRYPTION_KEY = 'test_encryption_key_32_chars!!';
process.env.SESSION_SECRET = 'test_session_secret_key';

// Mock @octokit/rest to avoid ESM module issues
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      get: jest.fn().mockResolvedValue({ data: {} }),
      listForUser: jest.fn().mockResolvedValue({ data: [] }),
      listForOrg: jest.fn().mockResolvedValue({ data: [] }),
    },
    issues: {
      create: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      listForRepo: jest.fn().mockResolvedValue({ data: [] }),
    },
    pulls: {
      create: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
    rest: {
      repos: {
        get: jest.fn().mockResolvedValue({ data: {} }),
      },
    },
  })),
}));

// Mock node-llama-cpp to avoid native module issues in tests
jest.mock('node-llama-cpp', () => ({
  getLlama: jest.fn().mockResolvedValue({
    loadModel: jest.fn().mockResolvedValue({
      createContext: jest.fn().mockResolvedValue({
        getSequence: jest.fn().mockReturnValue({
          generateCompletion: jest.fn().mockResolvedValue('Test response'),
        }),
      }),
    }),
  }),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

