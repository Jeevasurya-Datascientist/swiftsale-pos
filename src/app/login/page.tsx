
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFirebaseAuthError = (error: any) => {
    let title = "Login Error";
    let description = "An unexpected error occurred. Please try again.";
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential': // Covers wrong password or user not found in newer SDK versions
        description = 'Incorrect email or password.';
        break;
      case 'auth/invalid-email':
        description = 'The email address is not valid.';
        break;
      case 'auth/user-disabled':
        description = 'This account has been disabled.';
        break;
      case "auth/popup-closed-by-user":
        title = "Sign-In Cancelled";
        description = "Google Sign-In was cancelled.";
        break;
      case "auth/cancelled-popup-request":
      case "auth/popup-blocked":
          title = "Sign-In Blocked";
          description = "Google Sign-In popup was blocked by the browser. Please allow popups for this site.";
          break;
      case 'auth/unauthorized-domain':
        title = "Domain Not Authorized";
        description = "This domain is not authorized for Firebase operations. Please add it to the authorized domains in your Firebase console's Authentication settings.";
        break;
      default:
        console.error("Firebase Login Error:", error);
    }
    toast({ variant: 'destructive', title, description });
  };

  const handleSuccessfulLogin = (user: UserCredential["user"]) => {
    if (user && user.email) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/');
    } else {
      toast({ variant: 'destructive', title: 'Login Error', description: 'Could not retrieve user details after login.' });
    }
  };

  const handleLogin: SubmitHandler<LoginFormValues> = async (data) => {
     if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
      handleFirebaseAuthError(error);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      toast({ title: 'Redirecting to Google Sign-In...', description: 'Please wait.' });
      const result = await signInWithPopup(auth, provider);
      handleSuccessfulLogin(result.user);
    } catch (error: any) {
      handleFirebaseAuthError(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your SwiftSale POS dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="h-12 text-base"
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password (min. 8 characters)</Label>
                <Link href="/forgot-password" passHref>
                  <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto">
                    Forgot your password?
                  </Button>
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="h-12 text-base pr-10"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-8 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : <><LogIn className="mr-2 h-5 w-5" /> Sign In</>}
            </Button>
          </form>
           <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full h-12 text-lg mt-6" onClick={handleGoogleLogin} disabled={isSubmitting}>
            <GoogleIcon /> Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center gap-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
