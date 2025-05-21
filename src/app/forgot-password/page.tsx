
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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleSendResetLink: SubmitHandler<ForgotPasswordFormValues> = (data) => {
    console.log('Forgot password attempt for:', data.email);
    // In a real app, you'd call your auth service here to send a reset link
    toast({
      title: 'Reset Link Sent (Simulated)',
      description: `If an account exists for ${data.email}, password reset instructions have been sent.`,
    });
    // For simulation purposes, redirect to reset password page
    // In a real app, the user would click a link in their email.
    router.push('/reset-password'); // Or router.push(`/reset-password?email=${data.email}`) if you want to pass email
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <KeyRound className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Forgot Your Password?</CardTitle>
          <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password (simulated).</CardDescription>
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
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg">
              Send Reset Link
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
