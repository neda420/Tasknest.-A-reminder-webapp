'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserByEmail, setAuthCookies, updateUser, hashPassword } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Small artificial delay to unify response timing
      const [user, hashed] = await Promise.all([
        getUserByEmail(formData.email),
        hashPassword(formData.password),
        new Promise(resolve => setTimeout(resolve, 400))
      ]);

      if (!user || user.password !== hashed) {
        toast.error('Invalid credentials provided');
        return;
      }

      if (!user.isActive) {
        toast.error('Account restricted. Please contact support.');
        return;
      }

      updateUser(user.id, { lastLogin: new Date().toISOString() });
      setAuthCookies(user);
      toast.success('Login successful!');

      // Smooth transition to dashboard
      const targetPath = user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard';
      router.replace(targetPath);
    } catch {
      toast.error('Authentication service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Enter your TaskNest credentials</p>
        </div>

        <Card className="border-none shadow-xl ring-1 ring-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Stay organized with your personal reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor={emailId} className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={passwordId} className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-sm font-bold transition-all shadow-md shadow-blue-100"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Continue to Dashboard'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                New to the platform?{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
