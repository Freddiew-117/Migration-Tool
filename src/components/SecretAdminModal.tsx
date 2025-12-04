import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface SecretAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if the email has super_admin role
      // First get user by email, then check their role
      // Note: This is a simplified check - in production, you'd want to verify the user exists first
      // For now, we'll just try to sign in and let the role check happen in AuthContext

      // Proceed with sign in if authorized
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Authentication Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome Admin",
        description: "Successfully authenticated.",
      });

      onOpenChange(false);
      setEmail('');
      setPassword('');

    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription className="text-center">
            Restricted access - authorized personnel only
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter authorized email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="flex-1"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};