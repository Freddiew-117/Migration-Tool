import React, { createContext, useContext, useEffect, useState } from 'react';
import { appwriteAuth, AppwriteUser, AppwriteSession } from '@/integrations/appwrite/auth';
import { appwrite, COLLECTIONS } from '@/integrations/appwrite/compat';

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
      const { data, error } = await appwrite
        .from(COLLECTIONS.USER_ROLES)
        .select('role')
        .eq('user_id', userId)
        .order('created_at', 'desc')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = appwriteAuth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          const currentUser = await appwriteAuth.getUser();
          setUser(currentUser);

          if (currentUser) {
            // Use setTimeout to prevent potential deadlock
            setTimeout(async () => {
              const role = await fetchUserRole(currentUser.id);
              setUserRole(role);
            }, 0);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session
    appwriteAuth.getSession().then(({ data, error }) => {
      if (data?.session) {
        setSession(data.session);
        appwriteAuth.getUser().then((currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            fetchUserRole(currentUser.id).then(setUserRole);
          }
        });
      }
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

