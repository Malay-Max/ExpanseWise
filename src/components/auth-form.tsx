
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signup, createSession } from '@/actions/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsSuccess(false);

    if (mode === 'signup') {
      const result = await signup(values);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Signup Error',
          description: result.error,
        });
      } else {
        setIsSuccess(true);
        toast({
          title: 'Signup Successful',
          description: result.success,
        });
        form.reset();
      }
    } else { // Login mode
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const idToken = await userCredential.user.getIdToken();
        
        const sessionResult = await createSession(idToken);
        
        if (sessionResult.error) {
           toast({
            variant: 'destructive',
            title: 'Login Error',
            description: sessionResult.error,
          });
        } else {
           toast({
            title: 'Login Successful',
            description: 'Redirecting to your dashboard...',
          });
          router.push('/dashboard');
          return; // prevent loading state from being reset
        }
      } catch (error: any) {
         let errorMessage = 'An unexpected error occurred. Please try again.';
          if (error.code) {
              switch (error.code) {
                  case 'auth/user-not-found':
                  case 'auth/wrong-password':
                  case 'auth/invalid-credential':
                      errorMessage = 'Invalid email or password.';
                      break;
                  default:
                      errorMessage = error.message;
                      break;
              }
          }
          toast({
              variant: 'destructive',
              title: 'Login Error',
              description: errorMessage,
          });
      }
    }

    setIsLoading(false);
  }

  const title = mode === 'login' ? 'Welcome Back!' : 'Create an Account';
  const description = mode === 'login' ? 'Enter your credentials to access your dashboard.' : 'Enter your email and password to get started.';
  const buttonText = mode === 'login' ? 'Login' : 'Sign Up';
  const linkText = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const linkHref = mode === 'login' ? '/signup' : '/login';

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess && mode === 'signup' ? (
          <div className="text-center p-4 bg-green-100/50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md">
            <p className="font-bold">Account Created!</p>
            <p className="text-sm">You can now log in with your new credentials.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {buttonText}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              {linkText}{' '}
              <Link href={linkHref} className="underline text-primary hover:text-primary/80">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
