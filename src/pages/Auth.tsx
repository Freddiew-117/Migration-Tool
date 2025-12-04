import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Leaf, ArrowLeft, Mail } from 'lucide-react';
import { account } from '@/integrations/appwrite/client';
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const {
    signIn,
    signUp,
    user,
    userRole,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // Only redirect if auth is fully loaded and user is logged in
    // Don't redirect if we're already on /admin (let ProtectedRoute handle it)
    if (!loading && user && window.location.pathname !== '/admin') {
      // If user is super admin, redirect to admin, otherwise to home
      if (userRole === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, userRole, loading, navigate]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const {
        error
      } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const {
        error
      } = await signUp(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      // Appwrite password recovery
      await account.createRecovery(
        recoveryEmail,
        `${window.location.origin}/auth`
      );
      const error = null; // Appwrite doesn't throw on success
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password recovery email sent! Check your inbox.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Home Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackHome}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/image-uploads/a5e6092d-4582-443f-afe2-08d896fcd42c.png" alt="Company Logo" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome To Circularity Finance</h1>
          </div>
          <p className="text-muted-foreground">
            {recoveryMode ? 'Reset your password' : 'Secure access to the regenerative finance ecosystem'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{recoveryMode ? 'Password Recovery' : 'Welcome'}</CardTitle>
            <CardDescription>
              {recoveryMode 
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to your account or create a new one'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recoveryMode ? (
              <div className="space-y-4">
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">Email</Label>
                    <Input 
                      id="recovery-email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={recoveryEmail} 
                      onChange={e => setRecoveryEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}

                  {message && <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Recovery Email'}
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setRecoveryMode(false);
                      setError('');
                      setMessage('');
                      setRecoveryEmail('');
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {error && <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className="text-center">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => {
                          setRecoveryMode(true);
                          setError('');
                          setMessage('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    </div>

                    {error && <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}

                    {message && <Alert>
                        <Leaf className="h-4 w-4" />
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Auth;