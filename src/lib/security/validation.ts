/**
 * Shared validation schemas for use across server actions.
 *
 * Centralizes password rules, common field constraints, and reusable
 * Zod schemas to ensure consistency across all auth and data flows.
 *
 * @module security/validation
 */

import { z } from 'zod';

/** Standard password requirements: 8–72 characters. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

/** Standard email validation with length limit per RFC 5321. */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email must be at most 254 characters');

/** Human name validation. */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

/** Candidate availability enum values. */
export const availabilitySchema = z.enum([
  'actively_looking',
  'open_to_offers',
  'not_available',
]);

/**
 * Wraps a Supabase/DB error into a generic user-facing message.
 * Prevents leaking internal error details to the client.
 */
export function safeErrorMessage(
  _error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  return fallback;
}
