
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff, Phone } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be exactly 10 digits." })
    .max(10, { message: "Phone number must be exactly 10 digits." })
    .regex(/^\d{10}$/, { message: "Phone number must contain only digits." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFirebaseAuthError = (error: any) => {
    let title = "Registration Error";
    let description = "An unexpected error occurred. Please try again.";
    switch (error.code) {
      case 'auth/email-already-in-use':
        description = 'This email address is already in use.';
        break;
      case 'auth/invalid-email':
        description = 'The email address is not valid.';
        break;
      case 'auth/operation-not-allowed':
        description = 'Email/password accounts are not enabled.';
        break;
      case 'auth/weak-password':
        description = 'The password is too weak.';
        break;
      case 'auth/unauthorized-domain':
        title = "Domain Not Authorized";
        description = "This domain is not authorized for Firebase operations. Please add it to the authorized domains in your Firebase console's Authentication settings.";
        break;
      default:
        console.error("Firebase Registration Error:", error);
    }
    toast({ variant: 'destructive', title, description });
  };

  const handleSuccessfulRegistration = (user: UserCredential["user"]) => {
    if (user && user.email) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      
      // Clear previous user's transactional data for a new registration
      localStorage.removeItem('appInvoices');
      // localStorage.removeItem('appProducts'); // Products persist
      // localStorage.removeItem('appServices'); // Services persist
      
      toast({
        title: 'Registration Successful',
        description: 'Account created! Redirecting to your dashboard...',
      });
      router.push('/');
    } else {
      toast({ variant: 'destructive', title: 'Registration Error', description: 'Could not retrieve user details after registration.' });
    }
  };

  const handleRegister: SubmitHandler<RegisterFormValues> = async (data) => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      handleSuccessfulRegistration(userCredential.user);
    } catch (error: any) {
      handleFirebaseAuthError(error);
    }
  };

  const handleGoogleRegister = async () => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      toast({ title: 'Redirecting to Google Sign-Up...', description: 'Please wait.' });
      const result = await signInWithPopup(auth, provider);
      handleSuccessfulRegistration(result.user);
    } catch (error: any) {
       handleFirebaseAuthError(error); // Use the same error handler
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join SwiftSale POS and streamline your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel" 
                  placeholder="Enter 10-digit phone number"
                  {...register("phoneNumber")}
                  className="h-12 text-base pl-10"
                  autoComplete="tel"
                />
              </div>
              {errors.phoneNumber && <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password (min. 8 characters)</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                {...register("password")}
                className="h-12 text-base pr-10"
                autoComplete="new-password"
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

            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                className="h-12 text-base pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-8 h-8 w-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : <> <UserPlus className="mr-2 h-5 w-5" /> Create Account</>}
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
          <Button variant="outline" className="w-full h-12 text-lg mt-6" onClick={handleGoogleRegister} disabled={isSubmitting}>
            <GoogleIcon /> Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center block pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
