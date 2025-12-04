/**
 * Unified Database Client
 * 
 * This file provides a single import point for database operations.
 * Currently uses Appwrite, but can be easily switched.
 */

export { appwrite as db, COLLECTIONS } from './appwrite/compat';
export { appwriteAuth as auth } from './appwrite/auth';

// Re-export for convenience
export type { AppwriteUser, AppwriteSession } from './appwrite/auth';

