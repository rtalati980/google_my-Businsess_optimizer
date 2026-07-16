'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, LayoutDashboard, MessageSquare, Megaphone, 
  FileText, ShieldAlert, Settings, LogOut, Sun, Moon, 
  Menu, X, ChevronDown, Check, Loader2, MapPin, TrendingUp,
  BarChart3, ClipboardCheck, Rocket
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { User, Business, Location } from '@/lib/types';

interface DashboardContextType {
  user: User | null;
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: (loc: Location) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation_state] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [gmbError, setGmbError] = useState<{ code: string; message: string } | null>(null);
  const [showDpdpBanner, setShowDpdpBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('dpdp_consent');
    if (!consent) {
      setShowDpdpBanner(true);
    }
  }, []);

  const handleAcceptDpdp = () => {
    localStorage.setItem('dpdp_consent', 'accepted');
    setShowDpdpBanner(false);
  };

  // Load authenticated user — locations are fetched in DashboardWrapper after user is set
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('gmb_auth_token');
        console.log('[Dashboard] Checking auth... Token:', token ? '✅' : '❌');

        if (!token) {
          console.warn('[Dashboard] No token found, redirecting to login');
          router.replace('/login?reason=no_token');
          return;
        }

        const currentUser = await apiService.getCurrentUser();
        console.log('[Dashboard] User loaded:', currentUser.email);
        setUser(currentUser);
      } catch (err: any) {
        console.error('[Dashboard] Auth check failed:', err.message || err);
        console.error('[Dashboard] Error details:', err.response?.status, err.response?.data);
        router.replace('/login?reason=auth_failed');
      }
    };
    fetchUser();
  }, [router]);

  // Handle theme loading
  useEffect(() => {
    const savedTheme = localStorage.getItem('gmb_theme') as 'light' | 'dark';
    const activeTheme = savedTheme || 'dark';
    setTheme(activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('gmb_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
      </div>
    }>
      <DashboardWrapper 
        user={user}
        locations={locations}
        setLocations={setLocations}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation_state}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        locationDropdownOpen={locationDropdownOpen}
        setLocationDropdownOpen={setLocationDropdownOpen}
        gmbError={gmbError}
        setGmbError={setGmbError}
        router={router}
        showDpdpBanner={showDpdpBanner}
        handleAcceptDpdp={handleAcceptDpdp}
      >
        {children}
      </DashboardWrapper>
    </Suspense>
  );
}

// Inner helper component to structure the state and layout
function DashboardWrapper({ 
  user, locations, setLocations, selectedLocation, setSelectedLocation, 
  isLoading, setIsLoading, theme, toggleTheme, sidebarOpen, setSidebarOpen, 
  locationDropdownOpen, setLocationDropdownOpen, gmbError, setGmbError, router, children,
  showDpdpBanner, handleAcceptDpdp
}: any) {

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setSubLoading(true);
      const token = localStorage.getItem('gmb_auth_token');
      const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');
      const res = await fetch(`${apiUrl}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription in layout:', err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // ignore
      }
    };
  }, []);

  const handleCheckout = async (planType: string) => {
    try {
      setCheckingOut(planType);
      const token = localStorage.getItem('gmb_auth_token');
      const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

      // 1. Create Order
      const res = await fetch(`${apiUrl}/api/subscriptions/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType })
      });

      if (!res.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderData = await res.json();
      const { orderId, amount, currency, keyId, simulation } = orderData;

      // Developer Fallback Simulation
      if (simulation) {
        const verifyRes = await fetch(`${apiUrl}/api/subscriptions/razorpay/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpayOrderId: orderId,
            planType
          })
        });
        if (verifyRes.ok) {
          await fetchSubscription();
          alert(`Successfully subscribed to ${planType} (Sandbox Simulator Mode)!`);
          window.location.reload();
        } else {
          alert('Sandbox payment verification failed.');
        }
        return;
      }

      // Live Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "BizLocalPilot",
        description: `${planType} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${apiUrl}/api/subscriptions/razorpay/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planType
            })
          });

          if (verifyRes.ok) {
            await fetchSubscription();
            alert(`Payment successful! Welcome to the ${planType} plan.`);
            window.location.reload();
          } else {
            alert("Signature verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#6d28d9"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed to initialize.');
    } finally {
      setCheckingOut(null);
    }
  };

  const isTrialExpired = 
    subscription && 
    subscription.status === 'TRIALING' && 
    new Date() > new Date(subscription.currentPeriodEnd);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setGmbError(null);
        const businesses = await apiService.getBusinesses();
        if (businesses.length > 0) {
          const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');
          const res = await fetch(`${apiUrl}/api/locations`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('gmb_auth_token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setLocations(data);
            if (data.length > 0) {
              const activeLocId = localStorage.getItem('gmb_active_location_id');
              const activeLoc = data.find((l: any) => l.id === activeLocId) || data[0];
              setSelectedLocation(activeLoc);
              localStorage.setItem('gmb_active_location_id', activeLoc.id);
            }
          }
        }
      } catch (err: any) {
        if (err.code === 'GMB_API_QUOTA_EXCEEDED') {
          setGmbError({ code: 'GMB_API_QUOTA_EXCEEDED', message: err.message });
        } else {
          console.error('Error fetching locations:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchLocations();
    }
  }, [user, setLocations, setSelectedLocation, setIsLoading]);

  const handleLocationSwitch = (loc: Location) => {
    setSelectedLocation(loc);
    localStorage.setItem('gmb_active_location_id', loc.id);
    setLocationDropdownOpen(false);
    // Reload dashboard page to fetch stats for the new location
    router.refresh();
  };

  const handleLogout = () => {
    localStorage.removeItem('gmb_auth_token');
    document.cookie = 'gmb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    router.replace('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile Audit', href: '/dashboard/audit', icon: ClipboardCheck },
    { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Sentiment Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Posts Builder', href: '/dashboard/posts', icon: Megaphone },
    { name: 'Weekly Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'AI SEO Auditor', href: '/dashboard/seo', icon: TrendingUp },
    { name: 'Competitors', href: '/dashboard/competitors', icon: ShieldAlert },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 text-violet-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, locations, selectedLocation, setSelectedLocation: handleLocationSwitch, isLoading, theme, toggleTheme }}>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
              <div className="p-2 gradient-bg rounded-xl shadow-lg shadow-primary/20">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight gradient-text">BizLocalPilot</span>
                <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase">AI Platform</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = path === item.href || (path.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </a>
                );
              })}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-border bg-secondary/20">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full ring-2 ring-primary/20" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-foreground">{user.name}</p>
                  <p className="text-[10px] truncate text-muted-foreground">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header & Sidebar drawer */}
        <div className="flex-1 flex flex-col md:pl-64">
          <header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 md:hidden hover:bg-secondary rounded-lg text-muted-foreground"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Location Switcher Dropdown */}
              {locations.length > 0 && selectedLocation && (
                <div className="relative">
                  <button
                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary border border-border rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="max-w-[120px] sm:max-w-[180px] truncate">{selectedLocation.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {locationDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-secondary/50 border-b border-border">
                        Select Location
                      </div>
                      {locations.map((loc: Location) => (
                        <button
                          key={loc.id}
                          onClick={() => handleLocationSwitch(loc)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
                        >
                          <span className="truncate">{loc.name}</span>
                          {selectedLocation.id === loc.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
              </button>
            </div>
          </header>

          {/* Mobile Navigation Drawer Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="relative flex flex-col w-72 bg-card border-r border-border h-full">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    <span className="font-extrabold gradient-text">BizLocalPilot AI</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-secondary rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = path === item.href || (path.startsWith(item.href) && item.href !== '/dashboard');
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </a>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] truncate text-muted-foreground">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive">
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GMB API Access Required Banner */}
          {gmbError?.code === 'GMB_API_QUOTA_EXCEEDED' && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="font-bold text-amber-300 text-sm">⚠️ Google Business Profile API Access Required</p>
                <p className="text-xs mt-1 text-amber-200/80">
                  Your Google Cloud project has not been granted access to the Business Profile API yet.
                  Google requires you to manually request access before the API can be used.
                </p>
              </div>
              <a
                href="https://developers.google.com/my-business/content/prereqs"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors"
              >
                Request API Access →
              </a>
            </div>
          )}

          {/* Page contents */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* DPDP Act 2023 Consent Notice Banner */}
          {showDpdpBanner && (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                🛡️ DPDP Act Consent Notice
              </h4>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                In compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India, we notify you that we collect and process your name, email, and Google Business OAuth tokens purely to automate your reviews and postings.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleAcceptDpdp}
                  className="flex-1 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/25"
                >
                  I Accept & Consent
                </button>
                <button
                  onClick={() => alert("Privacy Notice: All data processing is strictly consent-driven. You can revoke consent at any time from your SaaS Settings page by deleting your account.")}
                  className="px-3 py-2 bg-secondary hover:bg-secondary/95 text-foreground text-[10px] font-bold rounded-xl active:scale-95 transition-all"
                >
                  More Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Trial Expired Paywall Overlay */}
      {isTrialExpired && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center">
            {/* Background ambient glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="space-y-3 relative">
              <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Your Free Trial Has Expired</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Your 14-day trial of BizLocalPilot has completed. Subscribing to a plan lets you continue managing GMB profiles, reviews, and AI automations.
              </p>
            </div>

            {/* Plan Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 relative text-left">
              {/* Basic Plan */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Basic Plan</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Perfect for single locations</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹999</span>
                    <span className="text-[10px] text-slate-400">/ month</span>
                  </div>
                  <ul className="text-[10px] text-slate-300 mt-4 space-y-2">
                    <li className="flex items-center gap-1.5">✓ 1 GMB Location</li>
                    <li className="flex items-center gap-1.5">✓ 5 AI Replies/mo</li>
                    <li className="flex items-center gap-1.5">✓ Weekly Audits</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout('BASIC')}
                  disabled={checkingOut !== null}
                  className="w-full py-2 bg-secondary hover:bg-secondary/90 text-foreground text-xs font-bold rounded-xl active:scale-95 transition-all mt-5"
                >
                  {checkingOut === 'BASIC' ? 'Opening...' : 'Select Basic'}
                </button>
              </div>

              {/* Premium Plan */}
              <div className="bg-slate-950 border border-primary/30 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors relative">
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[8px] font-extrabold uppercase rounded-full tracking-wider">
                  Popular
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-primary">Premium Plan</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Unlock full capabilities</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹1,499</span>
                    <span className="text-[10px] text-slate-400">/ month</span>
                  </div>
                  <ul className="text-[10px] text-slate-300 mt-4 space-y-2">
                    <li className="flex items-center gap-1.5">✓ Unlimited Locations</li>
                    <li className="flex items-center gap-1.5">✓ Unlimited AI Autopilot</li>
                    <li className="flex items-center gap-1.5">✓ AI Post Generator</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout('PREMIUM')}
                  disabled={checkingOut !== null}
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all mt-5 shadow-lg shadow-primary/25"
                >
                  {checkingOut === 'PREMIUM' ? 'Opening...' : 'Select Premium'}
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout of Account
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContext.Provider>
  );
}
