
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { sendPasswordResetEmail } from "firebase/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleSendResetLink: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase Error', description: 'Firebase authentication is not initialized.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${data.email}, a password reset link has been sent. Please check your inbox.`,
        duration: 7000, // Longer duration for this message
      });
      // Do not redirect automatically. User needs to check their email.
      // Optionally, you could clear the form or navigate to a confirmation page.
    } catch (error: any) {
      let title = "Password Reset Error";
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/user-not-found':
          description = 'No account found with this email address.';
          // To prevent user enumeration, Firebase sends email even if user not found.
          // So, show a generic success message to the user regardless.
          toast({
            title: 'Password Reset Email Sent',
            description: `If an account exists for ${data.email}, a password reset link has been sent. Please check your inbox.`,
            duration: 7000,
          });
          return; // Exit without showing specific error for user-not-found
        case 'auth/invalid-email':
          description = 'The email address is not valid.';
          break;
        case 'auth/too-many-requests':
          description = 'Too many requests. Please try again later.';
          break;
        default:
          console.error("Firebase Password Reset Error:", error);
      }
      toast({ variant: 'destructive', title, description });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <KeyRound className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Forgot Your Password?</CardTitle>
          <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSendResetLink)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="h-12 text-base pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block pt-6">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
