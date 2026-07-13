'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('[Callback] Token:', token ? '✅ Present' : '❌ Missing');
    console.log('[Callback] Error:', error || '❌ None');

    if (error) {
      console.error('[Callback] OAuth error:', error);
      router.replace('/login?error=' + error);
      return;
    }

    if (token) {
      try {
        // Save JWT token
        localStorage.setItem('gmb_auth_token', token);
        document.cookie = `gmb_auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        console.log('[Callback] Token saved, redirecting to dashboard...');
        // Forward to dashboard
        setTimeout(() => router.replace('/dashboard'), 500);
      } catch (e) {
        console.error('[Callback] Error saving token:', e);
        router.replace('/login?error=token_save_failed');
      }
    } else {
      // Redirect to login on authentication failure
      console.warn('[Callback] No token received from backend');
      router.replace('/login?error=no_token');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <h3 className="text-xl font-bold tracking-tight">Completing Google Authentication</h3>
      <p className="text-sm text-muted-foreground mt-2">Preparing your BizLocalPilot AI dashboard...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
