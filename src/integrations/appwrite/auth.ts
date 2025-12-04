/**
 * Appwrite Auth Compatibility Layer
 * 
 * Provides Supabase-like auth API on top of Appwrite
 */

import { account, ID } from './client';
import { Models } from 'appwrite';

// Types to match Supabase auth types
export interface AppwriteUser {
  id: string;
  email: string;
  name?: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AppwriteSession {
  $id: string;
  userId: string;
  provider: string;
  providerUid: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: string;
  providerRefreshToken: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
  factors: string[];
  secret: string;
  mfaUpdatedAt: string;
}

// Convert Appwrite user to Supabase-like format
function convertUser(user: Models.User<Models.Preferences>): AppwriteUser {
  return {
    id: user.$id,
    email: user.email,
    name: user.name,
    emailVerification: user.emailVerification,
    phoneVerification: user.phoneVerification,
    prefs: user.prefs,
    createdAt: user.$createdAt,
    updatedAt: user.$updatedAt,
  };
}

// Convert Appwrite session to Supabase-like format
function convertSession(session: Models.Session): AppwriteSession {
  return {
    $id: session.$id,
    userId: session.userId,
    provider: session.provider,
    providerUid: session.providerUid,
    providerAccessToken: session.providerAccessToken,
    providerAccessTokenExpiry: session.providerAccessTokenExpiry,
    providerRefreshToken: session.providerRefreshToken,
    ip: session.ip,
    osCode: session.osCode,
    osName: session.osName,
    osVersion: session.osVersion,
    clientType: session.clientType,
    clientCode: session.clientCode,
    clientName: session.clientName,
    clientVersion: session.clientVersion,
    deviceName: session.deviceName,
    deviceBrand: session.deviceBrand,
    deviceModel: session.deviceModel,
    countryCode: session.countryCode,
    countryName: session.countryName,
    current: session.current,
    factors: session.factors,
    secret: session.secret,
    mfaUpdatedAt: session.mfaUpdatedAt,
  };
}

/**
 * Supabase-like auth interface
 */
export const appwriteAuth = {
  /**
   * Sign up with email and password
   */
  async signUp(params: {
    email: string;
    password: string;
    options?: {
      data?: Record<string, any>;
      emailRedirectTo?: string;
    };
  }): Promise<{ data: { user: AppwriteUser | null; session: AppwriteSession | null } | null; error: any }> {
    try {
      const user = await account.create(
        ID.unique(),
        params.email,
        params.password,
        params.options?.data?.full_name || params.options?.data?.name || ''
      );

      // Auto-create session after signup
      let session: AppwriteSession | null = null;
      try {
        const appwriteSession = await account.createEmailPasswordSession(params.email, params.password);
        session = convertSession(appwriteSession);
      } catch (sessionError) {
        console.warn('Could not create session after signup:', sessionError);
      }

      return {
        data: {
          user: convertUser(user),
          session,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign up',
          status: error.code || 400,
        },
      };
    }
  },

  /**
   * Sign in with email and password
   */
  async signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<{ data: { user: AppwriteUser; session: AppwriteSession } | null; error: any }> {
    try {
      const session = await account.createEmailPasswordSession(params.email, params.password);
      const user = await account.get();

      return {
        data: {
          user: convertUser(user),
          session: convertSession(session),
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign in',
          status: error.code || 401,
        },
      };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: any }> {
    try {
      await account.deleteSession('current');
      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to sign out',
          status: error.code || 400,
        },
      };
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<{ data: { session: AppwriteSession | null } | null; error: any }> {
    try {
      const session = await account.getSession('current');
      return {
        data: {
          session: convertSession(session),
        },
        error: null,
      };
    } catch (error: any) {
      // No session is not an error
      if (error.code === 401 || error.type === 'general_unauthorized_scope') {
        return {
          data: {
            session: null,
          },
          error: null,
        };
      }
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get session',
          status: error.code || 400,
        },
      };
    }
  },

  /**
   * Get current user
   */
  async getUser(): Promise<AppwriteUser | null> {
    try {
      const user = await account.get();
      return convertUser(user);
    } catch (error) {
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: AppwriteSession | null) => void) {
    // Poll for auth state changes (Appwrite doesn't have real-time auth events)
    let lastSessionId: string | null = null;

    const checkAuthState = async () => {
      try {
        const { data } = await appwriteAuth.getSession();
        const currentSessionId = data?.session?.$id || null;

        if (currentSessionId !== lastSessionId) {
          if (lastSessionId === null && currentSessionId) {
            callback('SIGNED_IN', data?.session || null);
          } else if (lastSessionId && currentSessionId === null) {
            callback('SIGNED_OUT', null);
          } else if (currentSessionId) {
            callback('TOKEN_REFRESHED', data?.session || null);
          }
          lastSessionId = currentSessionId;
        }
      } catch (error) {
        // Ignore errors
      }
    };

    // Check immediately
    checkAuthState();

    // Poll every 2 seconds
    const interval = setInterval(checkAuthState, 2000);

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
  },
};


