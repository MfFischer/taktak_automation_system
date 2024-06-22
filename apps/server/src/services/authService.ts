/**
 * Authentication service
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { getLocalDatabase } from '../database/pouchdb';
import { logger } from '../utils/logger';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { generateToken, AuthUser } from '../middleware/auth';

interface User {
  _id: string;
  _rev?: string;
  type: 'user';
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private db = getLocalDatabase();

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
    logger.info('Registering new user', { email, name });

    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      _id: `user_${uuidv4()}`,
      type: 'user',
      email,
      name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.put(user);

    logger.info('User registered successfully', { userId: user._id, email });

    const authUser: AuthUser = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(authUser);

    return { user: authUser, token };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    logger.info('User login attempt', { email });

    // Find user
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      logger.warn('Invalid password attempt', { email });
      throw new AuthenticationError('Invalid email or password');
    }

    logger.info('User logged in successfully', { userId: user._id, email });

    const authUser: AuthUser = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(authUser);

    return { user: authUser, token };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser> {
    try {
      const user = await this.db.get<User>(userId);

      if (user.type !== 'user') {
        throw new NotFoundError('User not found');
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        throw new NotFoundError('User not found');
      }
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: { name?: string; email?: string }): Promise<AuthUser> {
    logger.info('Updating user profile', { userId });

    const user = await this.db.get<User>(userId);

    if (user.type !== 'user') {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== user.email) {
      const existingUser = await this.findUserByEmail(updates.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update user
    const updatedUser: User = {
      ...user,
      name: updates.name || user.name,
      email: updates.email || user.email,
      updatedAt: new Date(),
    };

    await this.db.put(updatedUser);

    logger.info('User profile updated', { userId });

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    logger.info('Changing user password', { userId });

    const user = await this.db.get<User>(userId);

    if (user.type !== 'user') {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    const updatedUser: User = {
      ...user,
      passwordHash,
      updatedAt: new Date(),
    };

    await this.db.put(updatedUser);

    logger.info('Password changed successfully', { userId });
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'user',
          email,
        },
        limit: 1,
      });

      return result.docs.length > 0 ? (result.docs[0] as User) : null;
    } catch (error) {
      logger.error('Error finding user by email', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}

