/**
 * Authentication Utilities
 *
 * JWT token generation, password hashing, session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User, UserStatus, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'chocosfera_session';

// ============================================
// TYPES
// ============================================

export interface JWTPayload {
  userId: string;
  email: string;
  nick: string;
  status: UserStatus;
  role: UserRole;
  familyId?: string;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  nick: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  familyId?: string;
  telegramAccess: boolean;
  avatarUrl?: string;
}

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT TOKENS
// ============================================

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    nick: user.nick,
    status: user.status,
    role: user.role,
    familyId: user.familyId ?? undefined,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// SESSION COOKIES
// ============================================

/**
 * Set session cookie with JWT token
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get session cookie
 */
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Get current authenticated user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    nick: payload.nick,
    email: payload.email,
    status: payload.status,
    role: payload.role,
    familyId: payload.familyId,
    telegramAccess: payload.status === UserStatus.ADULT_VERIFIED,
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR);
}

/**
 * Check if user is adult (verified)
 */
export async function isAdult(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.status === UserStatus.ADULT_VERIFIED;
}

/**
 * Check if user is minor
 */
export async function isMinor(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.status === UserStatus.MINOR;
}

/**
 * Check if user has Telegram access
 */
export async function hasTelegramAccess(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.telegramAccess;
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password requirements
 * - Minimum 15 characters
 * - At least 1 uppercase
 * - At least 1 lowercase
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 15) {
    errors.push('Password must be at least 15 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// NICK VALIDATION
// ============================================

/**
 * Validate nick (username) requirements
 * - 3-30 characters
 * - Alphanumeric, underscore, hyphen only
 * - No spaces
 */
export function validateNick(nick: string): { isValid: boolean; error?: string } {
  if (nick.length < 3) {
    return { isValid: false, error: 'Nick must be at least 3 characters' };
  }

  if (nick.length > 30) {
    return { isValid: false, error: 'Nick must be at most 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(nick)) {
    return {
      isValid: false,
      error: 'Nick can only contain letters, numbers, underscore, and hyphen',
    };
  }

  return { isValid: true };
}
