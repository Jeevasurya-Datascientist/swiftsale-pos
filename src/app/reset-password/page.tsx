
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LockKeyhole, Eye, EyeOff, RotateCcw, AlertTriangle } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"; // Import confirmPasswordReset

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState<boolean | null>(null); // null: verifying, true: verified, false: invalid
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      if (!auth) {
        toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
        setCodeVerified(false);
        setVerificationError('Firebase not initialized. Cannot verify reset code.');
        return;
      }
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          console.log("Password reset code verified for email:", email);
          setCodeVerified(true);
          setVerificationError(null);
        })
        .catch((error) => {
          console.error("Invalid password reset code:", error);
          setCodeVerified(false);
          let description = "Invalid or expired password reset link.";
          if (error.code === 'auth/expired-action-code') {
            description = "This password reset link has expired. Please request a new one.";
          } else if (error.code === 'auth/invalid-action-code') {
            description = "This password reset link is invalid. It may have already been used or does not exist.";
          }
          setVerificationError(description);
          toast({ variant: 'destructive', title: 'Link Error', description });
        });
    } else {
      setCodeVerified(false);
      setVerificationError("No password reset code found in the link. Please use the link from your email.");
       toast({ variant: 'destructive', title: 'Link Error', description: "Password reset code is missing. Please use the link provided in your email." });
    }
  }, [searchParams, toast]);

  const handleResetPassword: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    if (!oobCode) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password reset code is missing.' });
      return;
    }
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, data.newPassword);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been changed. Please log in with your new password.',
      });
      router.push('/login');
    } catch (error: any) {
      let title = "Password Reset Error";
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/expired-action-code':
          description = 'This password reset link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          description = 'This password reset link is invalid. It may have already been used or does not exist.';
          break;
        case 'auth/user-disabled':
          description = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
           // Should ideally not happen if code was verified, but good to handle
          description = 'No account found for this reset link.';
          break;
        case 'auth/weak-password':
          description = 'The new password is too weak. Please choose a stronger password.';
          break;
        default:
          console.error("Firebase Confirm Password Reset Error:", error);
      }
      toast({ variant: 'destructive', title, description });
    }
  };

  if (codeVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  if (codeVerified === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive rounded-full p-3 w-fit mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive">Invalid Link</CardTitle>
            <CardDescription>{verificationError || "This password reset link is invalid or has expired."}</CardDescription>
          </CardHeader>
          <CardFooter className="text-center block pt-6">
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link from the{' '}
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot Password
              </Link> page.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <RotateCcw className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="newPassword">New Password</Label>
               <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 8 characters)"
                  {...register("newPassword")}
                  className="h-12 text-base pl-10 pr-10"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  {...register("confirmPassword")}
                  className="h-12 text-base pl-10 pr-10"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !codeVerified}>
             <RotateCcw className="mr-2 h-5 w-5" /> {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block pt-6">
          <p className="text-sm text-muted-foreground">
            Back to{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap the component with Suspense because useSearchParams can only be used in a Client Component that is a child of a Suspense boundary.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
