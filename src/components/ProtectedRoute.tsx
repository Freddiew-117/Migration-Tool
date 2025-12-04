import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperAdmin = false 
}) => {
  const { user, userRole, loading } = useAuth();

  // Debug logging
  if (requireSuperAdmin) {
    console.log('🔐 ProtectedRoute Debug:', {
      user: user ? user.email : 'null',
      userRole,
      loading,
      requireSuperAdmin,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Only redirect if we're sure there's no user (not just loading)
    if (!loading) {
      return <Navigate to="/auth" replace />;
    }
    // If still loading, show loading screen
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if database might not be set up (userRole is null but user exists)
  const mightNeedDatabaseSetup = user && !userRole && requireSuperAdmin;

  if (requireSuperAdmin) {
    if (mightNeedDatabaseSetup) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Alert variant="destructive">
              <Database className="h-4 w-4" />
              <AlertTitle>Missing `user_roles` Table or Permissions</AlertTitle>
              <AlertDescription className="mt-2">
                The <code>user_roles</code> table either doesn't exist or doesn't have read permissions set. 
                <strong className="block mt-2">Most likely: Missing Permissions!</strong>
                Check the table's Settings → Permissions and add read access for <code>users</code> role.
              </AlertDescription>
            </Alert>
            
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Quick Setup:</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">1. Create Database</p>
                  <p className="text-muted-foreground ml-4">
                    Appwrite Dashboard → Databases → Create Database<br/>
                    Database ID: <code className="bg-muted px-1 rounded">migration-portal</code>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">2. Create Collection: <code className="bg-muted px-1 rounded">user_roles</code></p>
                  <p className="text-muted-foreground ml-4">
                    Click on your database → Click <strong>"Create Table"</strong> button<br/>
                    (Appwrite calls collections "Tables" in the UI)<br/>
                    Add attributes: <code>user_id</code> (String), <code>role</code> (String), <code>created_at</code> (DateTime)
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">3. Add Your Admin Role</p>
                  <p className="text-muted-foreground ml-4">
                    Click on <code>user_roles</code> collection → Click <strong>"+ Add Document"</strong><br/>
                    Add fields:<br/>
                    - <code>user_id</code>: <code className="bg-muted px-1 rounded">{user.id}</code><br/>
                    - <code>role</code>: <code className="bg-muted px-1 rounded">super_admin</code>
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ Most Common Issue: Missing Permissions
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    If the table exists, go to the table's <strong>Settings</strong> tab and add <code>users</code> role to Read Access.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  See <code>APPWRITE_PERMISSIONS_FIX.md</code> for permission setup, or <code>CREATE_USER_ROLES_TABLE.md</code> to create the table.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (userRole !== 'super_admin') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this area.
            </p>
            <p className="text-sm text-muted-foreground">
              Super admin access required.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;