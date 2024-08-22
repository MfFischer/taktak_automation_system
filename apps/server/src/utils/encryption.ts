/**
 * Encryption utilities for secure key storage
 * Uses AES-256-CBC encryption
 */

import CryptoJS from 'crypto-js';

import { config } from '../config/environment';

const ENCRYPTION_KEY = config.security.encryptionKey;

/**
 * Encrypts a string using AES-256
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts an AES-256 encrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Encrypted text cannot be empty');
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const text = decrypted.toString(CryptoJS.enc.Utf8);

    if (!text) {
      throw new Error('Decryption resulted in empty string - possibly wrong key');
    }

    return text;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hashes a string using SHA-256
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

/**
 * Generates a random string for tokens/IDs
 */
export function generateRandomString(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length / 2).toString();
}

/**
 * Validates if a string is properly encrypted
 */
export function isEncrypted(text: string): boolean {
  try {
    // Try to decrypt - if it fails, it's not encrypted
    decrypt(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Securely compares two strings (timing-safe)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export default {
  encrypt,
  decrypt,
  hash,
  generateRandomString,
  isEncrypted,
  secureCompare,
};

