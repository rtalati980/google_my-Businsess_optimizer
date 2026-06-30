'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('./landing/page'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gmb_auth_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setIsLoggedIn(false);
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-2" />
        <span className="text-xs font-bold text-slate-400">Loading GMB AI Manager...</span>
      </div>
    );
  }

  return <LandingPage />;
}
