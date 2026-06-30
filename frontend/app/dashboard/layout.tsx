'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, LayoutDashboard, MessageSquare, Megaphone, 
  FileText, ShieldAlert, Settings, LogOut, Sun, Moon, 
  Menu, X, ChevronDown, Check, Loader2, MapPin, TrendingUp,
  BarChart3
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

  // Load authenticated user — locations are fetched in DashboardWrapper after user is set
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login');
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
  locationDropdownOpen, setLocationDropdownOpen, gmbError, setGmbError, router, children 
}: any) {

  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setGmbError(null);
        const businesses = await apiService.getBusinesses();
        if (businesses.length > 0) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                GMB AI Manager
              </span>
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
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-extrabold">GMB AI Manager</span>
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
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
