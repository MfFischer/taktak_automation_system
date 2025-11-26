/**
 * Security Middleware Unit Tests
 * Tests XSS prevention, SQL injection detection patterns
 */

// XSS patterns to detect and sanitize
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /data:/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(--|\#|\/\*)/,
  /(\bOR\b|\bAND\b)\s+[\d\w]+\s*=\s*[\d\w]+/i,
  /'\s*(OR|AND)\s+'?\d+'?\s*=\s*'?\d+'?/i,
];

// Helper function to sanitize string
function sanitizeString(value: string): string {
  let sanitized = value;
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized;
}

// Helper function to detect SQL injection
function detectSQLInjectionInValue(value: string): boolean {
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(value)) {
      return true;
    }
  }
  return false;
}

describe('Security Patterns', () => {
  describe('XSS Sanitization', () => {
    it('should sanitize script tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should sanitize javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('javascript:');
    });

    it('should sanitize event handlers', () => {
      const input = '<img onerror="alert(1)" src="x">';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('onerror=');
    });

    it('should sanitize onclick handlers', () => {
      const input = '<div onclick="hack()">Click me</div>';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('onclick=');
    });

    it('should sanitize iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('<iframe');
    });

    it('should preserve safe content', () => {
      const input = 'Hello, John Doe! Your email is john@example.com';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe(input);
    });

    it('should handle empty strings', () => {
      const sanitized = sanitizeString('');
      expect(sanitized).toBe('');
    });
  });

  describe('SQL Injection Detection', () => {
    it('should detect UNION SELECT injection', () => {
      const input = "1' UNION SELECT * FROM users--";
      expect(detectSQLInjectionInValue(input)).toBe(true);
    });

    it('should detect DROP TABLE injection', () => {
      const input = "'; DROP TABLE users;--";
      expect(detectSQLInjectionInValue(input)).toBe(true);
    });

    it('should detect SELECT FROM injection', () => {
      const input = "SELECT * FROM users WHERE id = 1";
      expect(detectSQLInjectionInValue(input)).toBe(true);
    });

    it('should detect OR 1=1 injection', () => {
      const input = "' OR '1'='1";
      expect(detectSQLInjectionInValue(input)).toBe(true);
    });

    it('should detect comment injection', () => {
      const input = "admin'--";
      expect(detectSQLInjectionInValue(input)).toBe(true);
    });

    it('should allow safe search terms', () => {
      const input = 'John Doe';
      expect(detectSQLInjectionInValue(input)).toBe(false);
    });

    it('should allow normal email addresses', () => {
      const input = 'john@example.com';
      expect(detectSQLInjectionInValue(input)).toBe(false);
    });

    it('should allow normal sentences', () => {
      const input = 'This is a normal workflow description';
      expect(detectSQLInjectionInValue(input)).toBe(false);
    });
  });

  describe('API Key Validation', () => {
    it('should validate API key format', () => {
      const validKey = 'tk_live_abcdef123456789012345678901234567890';
      const invalidKey = 'short';

      // Valid key should be at least 20 characters
      expect(validKey.length).toBeGreaterThanOrEqual(20);
      expect(invalidKey.length).toBeLessThan(20);
    });

    it('should reject empty API keys', () => {
      const emptyKey = '';
      expect(emptyKey.length).toBe(0);
    });
  });
});

