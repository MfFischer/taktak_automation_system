/**
 * Tests for encryption utilities
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { encrypt, decrypt, hash, generateRandomString, isEncrypted, secureCompare } from './encryption';

describe('Encryption Utilities', () => {
  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = 'test_encryption_key_32_chars!!';
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'test';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should reject empty strings', () => {
      const plaintext = '';

      expect(() => encrypt(plaintext)).toThrow('Text to encrypt cannot be empty');
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = '你好世界 🌍';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('hash', () => {
    it('should produce consistent hash for same input', () => {
      const text = 'password123';
      const hash1 = hash(text);
      const hash2 = hash(text);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hash('password1');
      const hash2 = hash('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce fixed-length hash', () => {
      const hash1 = hash('short');
      const hash2 = hash('a very long string with many characters');

      expect(hash1.length).toBe(hash2.length);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      const length = 32;
      const random = generateRandomString(length);

      expect(random.length).toBe(length);
    });

    it('should generate different strings', () => {
      const random1 = generateRandomString(32);
      const random2 = generateRandomString(32);

      expect(random1).not.toBe(random2);
    });

    it('should only contain alphanumeric characters', () => {
      const random = generateRandomString(100);
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;

      expect(alphanumericRegex.test(random)).toBe(true);
    });
  });

  describe('isEncrypted', () => {
    it('should detect encrypted strings', () => {
      const plaintext = 'test';
      const encrypted = encrypt(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plaintext', () => {
      expect(isEncrypted('plaintext')).toBe(false);
      expect(isEncrypted('hello world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });
  });

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const str = 'password123';
      expect(secureCompare(str, str)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(secureCompare('password1', 'password2')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(secureCompare('short', 'longer string')).toBe(false);
    });

    it('should be timing-safe', () => {
      // This is a basic test - true timing attack resistance requires more sophisticated testing
      const str1 = 'a'.repeat(1000);
      const str2 = 'b'.repeat(1000);

      const start1 = Date.now();
      secureCompare(str1, str2);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      secureCompare(str1, str1);
      const time2 = Date.now() - start2;

      // Times should be similar (within 10ms)
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });
  });
});

