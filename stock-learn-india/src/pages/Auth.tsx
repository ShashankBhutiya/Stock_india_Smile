import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Disclaimer } from '@/components/Disclaimer';
import { Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupErrors, setSignupErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validateLogin = () => {
    const errors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      errors.email = 'Please enter a valid email address';
    }

    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors: { email?: string; password?: string; name?: string } = {};
    
    try {
      emailSchema.parse(signupEmail);
    } catch (e) {
      errors.email = 'Please enter a valid email address';
    }

    try {
      passwordSchema.parse(signupPassword);
    } catch (e) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!signupName.trim()) {
      errors.name = 'Please enter your name';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed', { description: error.message });
      }
    } else {
      toast.success('Welcome back!');
      navigate('/market');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Email already registered', {
          description: 'Please login instead or use a different email.',
        });
        setTab('login');
        setLoginEmail(signupEmail);
      } else {
        toast.error('Signup failed', { description: error.message });
      }
    } else {
      toast.success('Account created!', {
        description: 'You now have ₹10,00,000 virtual cash to start trading.',
      });
      navigate('/market');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">StockEdu India</h1>
          <p className="text-muted-foreground mt-1">Learn investing without real risk</p>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {tab === 'login'
                ? 'Sign in to continue your learning journey'
                : 'Start with ₹10,00,000 virtual cash'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-destructive mt-1">{loginErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1.5"
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-destructive mt-1">{loginErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1.5"
                    />
                    {signupErrors.name && (
                      <p className="text-sm text-destructive mt-1">{signupErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-destructive mt-1">{signupErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="mt-1.5"
                    />
                    {signupErrors.password && (
                      <p className="text-sm text-destructive mt-1">{signupErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="w-full max-w-md mt-6">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
