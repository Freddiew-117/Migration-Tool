import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteAuth, AppwriteUser, AppwriteSession } from '@/integrations/appwrite/auth';
import { db, COLLECTIONS } from '@/integrations/db';

interface AuthContextType {
  user: AppwriteUser | null;
  session: AppwriteSession | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [session, setSession] = useState<AppwriteSession | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await db
        .from(COLLECTIONS.USER_ROLES)
        .select('role')
        .eq('user_id', userId)
        .order('created_at', 'desc')
        .limit(1)
        .single();

      if (error) {
        // If database doesn't exist yet, return null gracefully
        if (error.code === '404' || error.message?.includes('not found')) {
          console.warn(`Collection '${COLLECTIONS.USER_ROLES}' not found. Please create the 'user_roles' table in Appwrite. See CREATE_USER_ROLES_TABLE.md for instructions.`);
          return null;
        }
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          return null;
        }
      }

      // Return the role if found, or null if no document exists
      // This allows ProtectedRoute to distinguish between "no role" and "user role"
      const role = data?.role || null;
      console.log('🔍 Fetched user role:', { userId, role, rawData: data });
      return role;
    } catch (error: any) {
      // If database doesn't exist, return null so ProtectedRoute can show setup message
      if (error?.code === '404' || error?.message?.includes('not found') || error?.message?.includes('Database not found')) {
        console.warn('Database/collection not found. Please create the database in Appwrite first.');
        return null;
      }
      console.error('Error fetching user role:', error);
      return null; // Return null on error so setup can be detected
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = appwriteAuth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          try {
            const currentUser = await appwriteAuth.getUser();
            setUser(currentUser);

            if (currentUser) {
              // Fetch role after user is set
              const role = await fetchUserRole(currentUser.id);
              setUserRole(role);
            }
          } catch (err) {
            console.error('Error getting user in auth state change:', err);
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session
    appwriteAuth.getSession().then(async ({ data, error }) => {
      try {
        if (data?.session) {
          setSession(data.session);
          const currentUser = await appwriteAuth.getUser();
          setUser(currentUser);
          if (currentUser) {
            const role = await fetchUserRole(currentUser.id);
            setUserRole(role);
          }
        }
      } catch (err) {
        console.error('Error checking session/getting user:', err);
      } finally {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Error checking session:', err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await appwriteAuth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          name: fullName || '',
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await appwriteAuth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await appwriteAuth.signOut();
  };

  const isSuperAdmin = userRole === 'super_admin';

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};