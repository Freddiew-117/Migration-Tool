/**
 * Appwrite Compatibility Layer
 * 
 * This file provides a Supabase-like API on top of Appwrite
 * to minimize code changes during migration.
 */

import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from './client';
import { Models } from 'appwrite';

// Type definitions to match Supabase patterns
export interface SupabaseLikeResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

export interface SupabaseLikeListResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

/**
 * Convert Appwrite error to Supabase-like error
 */
function handleError(error: any): { message: string; code?: string } {
  if (error?.message) {
    return {
      message: error.message,
      code: error.code?.toString(),
    };
  }
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN',
  };
}

/**
 * Supabase-like query builder
 */
class QueryBuilder<T = any> {
  private collectionId: string;
  private queries: string[] = [];
  private selectFields: string[] = [];

  constructor(collectionId: string) {
    this.collectionId = collectionId;
  }

  select(fields?: string): this {
    if (fields && fields !== '*') {
      this.selectFields = fields.split(',').map(f => f.trim());
    }
    return this;
  }

  eq(field: string, value: any): this {
    this.queries.push(Query.equal(field, value));
    return this;
  }

  neq(field: string, value: any): this {
    this.queries.push(Query.notEqual(field, value));
    return this;
  }

  is(field: string, value: any): this {
    // Appwrite doesn't have direct null checks in queries
    // We'll handle null filtering in execute() method
    if (value === null) {
      // Store null check for client-side filtering
      (this as any)._nullChecks = (this as any)._nullChecks || [];
      (this as any)._nullChecks.push({ field, isNull: true });
    } else {
      this.queries.push(Query.equal(field, value));
    }
    return this;
  }

  not(field: string, operator: string, value: any): this {
    // Handle .not('field', 'is', null) pattern
    if (operator === 'is' && value === null) {
      (this as any)._nullChecks = (this as any)._nullChecks || [];
      (this as any)._nullChecks.push({ field, isNull: false });
    } else {
      this.queries.push(Query.notEqual(field, value));
    }
    return this;
  }

  gt(field: string, value: any): this {
    this.queries.push(Query.greaterThan(field, value));
    return this;
  }

  lt(field: string, value: any): this {
    this.queries.push(Query.lessThan(field, value));
    return this;
  }

  gte(field: string, value: any): this {
    this.queries.push(Query.greaterThanEqual(field, value));
    return this;
  }

  lte(field: string, value: any): this {
    this.queries.push(Query.lessThanEqual(field, value));
    return this;
  }

  in(field: string, values: any[]): this {
    this.queries.push(Query.equal(field, values));
    return this;
  }

  order(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.queries.push(Query.orderAsc(field));
    if (direction === 'desc') {
      this.queries.pop();
      this.queries.push(Query.orderDesc(field));
    }
    return this;
  }

  limit(count: number): this {
    this.queries.push(Query.limit(count));
    return this;
  }

  async single(): Promise<SupabaseLikeResponse<T>> {
    try {
      const result = await databases.listDocuments<T>(
        DATABASE_ID,
        this.collectionId,
        this.queries.length > 0 ? this.queries : undefined
      );

      if (result.documents.length === 0) {
        return {
          data: null,
          error: {
            message: 'No documents found',
            code: 'PGRST116', // Match Supabase error code
          },
        };
      }

      return {
        data: result.documents[0] as T,
        error: null,
      };
    } catch (error: any) {
      // Enhanced error logging for debugging
      if (error.code === 404 || error.message?.includes('not found') || error.message?.includes('Database not found')) {
        console.error(`❌ Database/Collection not found or no read permissions.`, {
          databaseId: DATABASE_ID,
          collectionId: this.collectionId,
          error: error.message || error,
          errorCode: error.code,
          hint: 'Check: 1) Project ID in .env matches Appwrite, 2) Database ID matches, 3) Collection exists, 4) Permissions are set. See TROUBLESHOOT_404.md'
        });
      }
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  async execute(): Promise<SupabaseLikeListResponse<T>> {
    try {
      const result = await databases.listDocuments<T>(
        DATABASE_ID,
        this.collectionId,
        this.queries.length > 0 ? this.queries : undefined
      );

      let documents = result.documents as T[];

      // Handle null checks on client side
      const nullChecks = (this as any)._nullChecks || [];
      if (nullChecks.length > 0) {
        documents = documents.filter((doc: any) => {
          return nullChecks.every((check: any) => {
            if (check.isNull) {
              return doc[check.field] === null || doc[check.field] === undefined;
            } else {
              return doc[check.field] !== null && doc[check.field] !== undefined;
            }
          });
        });
      }

      return {
        data: documents,
        error: null,
      };
    } catch (error: any) {
      // Enhanced error logging for debugging
      if (error.code === 404 || error.message?.includes('not found') || error.message?.includes('Database not found')) {
        console.error(`❌ Database/Collection not found or no read permissions.`, {
          databaseId: DATABASE_ID,
          collectionId: this.collectionId,
          error: error.message || error,
          errorCode: error.code,
          hint: 'Check: 1) Project ID in .env matches Appwrite, 2) Database ID matches, 3) Collection exists, 4) Permissions are set. See TROUBLESHOOT_404.md'
        });
      }
      return {
        data: null,
        error: handleError(error),
      };
    }
  }
}

/**
 * Supabase-like database interface
 */
export const db = {
  from<T = any>(collectionId: string): QueryBuilder<T> {
    return new QueryBuilder<T>(collectionId);
  },
};

/**
 * Insert a document (Supabase-like)
 */
export async function insert<T = any>(
  collectionId: string,
  data: Omit<T, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId'>
): Promise<SupabaseLikeResponse<T>> {
  try {
    // Add timestamps if not provided (Appwrite uses $createdAt/$updatedAt, but we map to created_at/updated_at)
    const dataWithTimestamps = {
      ...data,
      created_at: (data as any).created_at || new Date().toISOString(),
      updated_at: (data as any).updated_at || new Date().toISOString(),
    };

    const result = await databases.createDocument<T>(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      dataWithTimestamps as any
    );

    return {
      data: result as T,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: handleError(error),
    };
  }
}

/**
 * Update a document (Supabase-like)
 */
export async function update<T = any>(
  collectionId: string,
  documentId: string,
  data: Partial<T>
): Promise<SupabaseLikeResponse<T>> {
  try {
    // Always update the updated_at timestamp
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const result = await databases.updateDocument<T>(
      DATABASE_ID,
      collectionId,
      documentId,
      dataWithTimestamp as any
    );

    return {
      data: result as T,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: handleError(error),
    };
  }
}

/**
 * Delete a document (Supabase-like)
 */
export async function remove(
  collectionId: string,
  documentId: string
): Promise<SupabaseLikeResponse<void>> {
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: handleError(error),
    };
  }
}

/**
 * Supabase-like client interface
 */
export const appwrite = {
  from: db.from,
  insert,
  update,
  remove,
};

// Re-export COLLECTIONS for convenience
export { COLLECTIONS } from './client';

