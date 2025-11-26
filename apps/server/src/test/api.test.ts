/**
 * API Response Format Tests
 * Tests API response structure and validation logic
 */

// Standard API response format
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Helper to create success response
function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

// Helper to create error response
function createErrorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: { code, message },
  };
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Validate workflow name
function isValidWorkflowName(name: string): boolean {
  return name.length >= 1 && name.length <= 100;
}

describe('API Response Format', () => {
  describe('Success Response', () => {
    it('should create valid success response', () => {
      const response = createSuccessResponse({ id: '123', name: 'Test' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123', name: 'Test' });
      expect(response.error).toBeUndefined();
    });

    it('should handle array data', () => {
      const response = createSuccessResponse([1, 2, 3]);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([1, 2, 3]);
    });

    it('should handle null data', () => {
      const response = createSuccessResponse(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });

  describe('Error Response', () => {
    it('should create valid error response', () => {
      const response = createErrorResponse('NOT_FOUND', 'Resource not found');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
      expect(response.error?.message).toBe('Resource not found');
      expect(response.data).toBeUndefined();
    });

    it('should handle authentication errors', () => {
      const response = createErrorResponse('UNAUTHORIZED', 'Invalid credentials');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle validation errors', () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('Input Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user domain.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('SecureP@ss!')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });
  });

  describe('Workflow Name Validation', () => {
    it('should accept valid workflow names', () => {
      expect(isValidWorkflowName('My Workflow')).toBe(true);
      expect(isValidWorkflowName('A')).toBe(true);
      expect(isValidWorkflowName('Lead Capture Automation')).toBe(true);
    });

    it('should reject invalid workflow names', () => {
      expect(isValidWorkflowName('')).toBe(false);
      expect(isValidWorkflowName('a'.repeat(101))).toBe(false);
    });
  });
});

describe('HTTP Status Codes', () => {
  const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  };

  it('should have correct success status codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
  });

  it('should have correct client error status codes', () => {
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it('should have correct server error status codes', () => {
    expect(HTTP_STATUS.INTERNAL_ERROR).toBe(500);
  });
});

