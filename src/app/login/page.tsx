import { AuthForm } from '@/components/auth-form';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Logo />
        </Link>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
