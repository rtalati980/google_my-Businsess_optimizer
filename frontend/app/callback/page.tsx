'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save JWT token
      localStorage.setItem('gmb_auth_token', token);
      document.cookie = `gmb_auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      // Forward to dashboard
      router.replace('/dashboard');
    } else {
      // Redirect to login on authentication failure
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <Loader2 className="h-10 w-10 text-violet-500 animate-spin mb-4" />
      <h3 className="text-xl font-bold tracking-tight">Completing Google Authentication</h3>
      <p className="text-sm text-slate-400 mt-2">Preparing your GMB AI Manager dashboard...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
