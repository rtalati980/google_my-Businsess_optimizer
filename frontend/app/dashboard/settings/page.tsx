'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { Subscription } from '@/lib/types';
import { 
  Settings, CreditCard, Shield, Sparkles, 
  Check, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function SettingsPage() {
  const { user, locations, selectedLocation } = useDashboard();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    category: '',
    phone: '',
    website: '',
    address: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [autoReply, setAutoReply] = useState({
    enabled: false,
    tone: 'FRIENDLY',
    minRating: 1,
    maxRating: 5,
    delayMinutes: 30,
  });
  const [notifications, setNotifications] = useState({
    notifyEnabled: false,
    notifyEmail: '',
    notifyOnRatingBelow: 3,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchSettings = async () => {
    if (!selectedLocation) return;
    try {
      setSettingsLoading(true);
      const arSettings = await apiService.getAutoReplySettings(selectedLocation.id);
      setAutoReply({
        enabled: arSettings.enabled,
        tone: arSettings.tone,
        minRating: arSettings.minRating,
        maxRating: arSettings.maxRating,
        delayMinutes: arSettings.delayMinutes
      });
      const notifSettings = await apiService.getNotificationSettings(selectedLocation.id);
      setNotifications({
        notifyEnabled: notifSettings.notifyEnabled,
        notifyEmail: notifSettings.notifyEmail,
        notifyOnRatingBelow: notifSettings.notifyOnRatingBelow
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedLocation]);

  const handleSaveAutoReply = async () => {
    if (!selectedLocation) return;
    try {
      setSettingsLoading(true);
      await apiService.updateAutoReplySettings(selectedLocation.id, autoReply);
      alert('Auto-Reply settings saved!');
    } catch (err) {
      console.error('Error saving auto reply settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!selectedLocation) return;
    try {
      setSettingsLoading(true);
      await apiService.updateNotificationSettings(selectedLocation.id, notifications);
      alert('Notification settings saved!');
    } catch (err) {
      console.error('Error saving notification settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDisconnectGmb = async () => {
    try {
      setDisconnecting(true);
      const res = await fetch(`${API_URL}/api/businesses/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gmb_auth_token')}`
        }
      });
      if (res.ok) {
        localStorage.removeItem('gmb_active_location_id');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to disconnect GMB:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnectGmb = () => {
    setConnecting(true);
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  useEffect(() => {
    if (selectedLocation) {
      setProfileForm({
        name: selectedLocation.name || '',
        category: selectedLocation.category || '',
        phone: selectedLocation.phone || '',
        website: selectedLocation.website || '',
        address: selectedLocation.address || '',
      });
    }
  }, [selectedLocation]);

  const handleSaveProfile = async () => {
    if (!selectedLocation) return;
    try {
      setProfileSaving(true);
      const token = localStorage.getItem('gmb_auth_token');
      const res = await fetch(`${API_URL}/api/locations/${selectedLocation.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        alert("Google Business Profile details updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update profile details. Please try again.");
      }
    } catch (err) {
      console.error('Failed to update GMB profile:', err);
      alert("An error occurred. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account?\n\n" +
      "In compliance with the DPDP Act 2023 (Right to Erasure), this will permanently delete your user profile, billing records, GMB access tokens, locations, synced reviews, scheduled posts, and AI reports from our database. This action CANNOT be undone."
    );
    if (!confirmDelete) return;

    try {
      setDeletingAccount(true);
      const res = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gmb_auth_token')}`
        }
      });
      if (res.ok) {
        alert("Your account and all associated personal data have been completely erased from our servers in compliance with the DPDP Act, 2023.");
        localStorage.removeItem('gmb_auth_token');
        localStorage.removeItem('gmb_active_location_id');
        window.location.href = '/login';
      } else {
        alert("Failed to delete account. Please try again or contact support.");
      }
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert("An error occurred during account deletion.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gmb_auth_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSub(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleCheckout = async (planType: string) => {
    try {
      setCheckingOut(planType);
      const token = localStorage.getItem('gmb_auth_token');

      // 1. Create Order
      const res = await fetch(`${API_URL}/api/subscriptions/razorpay/create-order`, {
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
        const verifyRes = await fetch(`${API_URL}/api/subscriptions/razorpay/verify-payment`, {
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
          const verifyRes = await fetch(`${API_URL}/api/subscriptions/razorpay/verify-payment`, {
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
          } else {
            alert("Signature verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#7c3aed"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout initiation failed:', err);
      alert('Could not start checkout. Please try again.');
    } finally {
      setCheckingOut(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">SaaS Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile, billing credentials, and Stripe subscription plans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Account Profile details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-primary" /> Profile Credentials
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-xs font-semibold text-foreground">
                  {user.name}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-xs font-semibold text-foreground">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Account Tenant Role
                </label>
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-xs font-semibold text-primary font-black uppercase">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Google Business Profile Connection */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Google Business Connection
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage your Google Business Profile connection. Under Sandbox mode, mock data is simulated. In Production mode, real profiles are fetched.
            </p>

            <div className="space-y-4 pt-2">
              {locations.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-secondary/20 border border-border rounded-xl">
                    <div className="text-xs font-bold text-foreground">Status: Connected</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {locations.length} branch location(s) currently loaded.
                    </div>
                    <div className="mt-2.5 max-h-24 overflow-y-auto space-y-1 text-[10px] font-semibold text-slate-400">
                      {locations.map((l: any) => (
                        <div key={l.id} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="truncate">{l.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectGmb}
                    disabled={disconnecting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-destructive hover:bg-destructive/95 text-destructive-foreground text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Disconnecting...
                      </>
                    ) : (
                      'Disconnect & Clear Sandbox Data'
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-border rounded-xl text-center space-y-3.5">
                  <p className="text-xs text-muted-foreground">No Google Business locations connected.</p>
                  <button
                    onClick={handleConnectGmb}
                    disabled={connecting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting...
                      </>
                    ) : (
                      'Connect Google Business Profile'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DPDP Compliance & Data Erasure */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black flex items-center gap-2 text-red-500">
              <Shield className="h-4.5 w-4.5" /> DPDP Privacy Compliance
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We process and protect your personal data in accordance with the <strong>Indian Digital Personal Data Protection (DPDP) Act, 2023</strong>.
            </p>
            <div className="text-[10px] space-y-1.5 text-muted-foreground bg-secondary/15 p-3 rounded-xl">
              <div>• <strong>Data Protection Officer (DPO):</strong> dpo@bizlocalpilot.in</div>
              <div>• <strong>Right to Erasure:</strong> You can request complete deletion of your data at any time.</div>
              <div>• <strong>Consent Withdrawal:</strong> You can withdraw consent and delete your account.</div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/35 text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Erasing data...
                  </>
                ) : (
                  'Delete Account & Permanent Erasure'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Simulation Plans */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-muted-foreground" /> Subscription Tier Mappings
              </h3>
              {sub && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  sub.status === 'ACTIVE' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {sub.planType} Tier: {sub.status}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Synch billing records...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Plan */}
                <div className={`border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between ${
                  sub?.planType === 'BASIC' 
                    ? 'border-primary bg-primary/[0.02]' 
                    : 'border-border bg-card'
                }`}>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-sm">Basic Plan</h4>
                    <p className="text-[10px] text-muted-foreground">Ideal for single GMB store locations.</p>
                    <div className="text-2xl font-black mt-2">₹999 <span className="text-[10px] text-muted-foreground font-normal">/ month</span></div>
                  </div>

                  <ul className="text-[10px] text-muted-foreground space-y-2 my-4">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Respond to 50 reviews/mo</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Weekly GMB post draft</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Track 1 competitor</li>
                  </ul>

                  <button
                    onClick={() => handleCheckout('BASIC')}
                    disabled={sub?.planType === 'BASIC' || checkingOut !== null}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      sub?.planType === 'BASIC'
                        ? 'bg-primary/10 text-primary border border-primary/20 cursor-default'
                        : 'bg-foreground text-background hover:opacity-90 active:scale-95'
                    }`}
                  >
                    {checkingOut === 'BASIC' ? 'Opening Razorpay...' : sub?.planType === 'BASIC' ? 'Active Plan' : 'Downgrade to Basic'}
                  </button>
                </div>

                {/* Premium Plan */}
                <div className={`border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between ${
                  sub?.planType === 'PREMIUM' 
                    ? 'border-primary bg-primary/[0.02]' 
                    : 'border-border bg-card'
                }`}>
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Popular
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-sm flex items-center gap-1.5">
                      Premium Plan <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-current" />
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Unlimited local search business growth.</p>
                    <div className="text-2xl font-black mt-2">₹1,499 <span className="text-[10px] text-muted-foreground font-normal">/ month</span></div>
                  </div>

                  <ul className="text-[10px] text-muted-foreground space-y-2 my-4">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Unlimited reviews reply</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> AI weekly audit logs</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Track 5 competitors matrix</li>
                  </ul>

                  <button
                    onClick={() => handleCheckout('PREMIUM')}
                    disabled={sub?.planType === 'PREMIUM' || checkingOut !== null}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      sub?.planType === 'PREMIUM'
                        ? 'bg-primary/10 text-primary border border-primary/20 cursor-default'
                        : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-md shadow-primary/25'
                    }`}
                  >
                    {checkingOut === 'PREMIUM' ? 'Opening Razorpay...' : sub?.planType === 'PREMIUM' ? 'Active Plan' : 'Pay with Razorpay'}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2 bg-secondary/10 p-3 rounded-xl">
              <AlertCircle className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Razorpay sandbox integration is active. If your credentials are not configured, it will simulate a successful payment instantly. Otherwise, it will trigger the secure Razorpay Checkout overlay supporting UPI, Netbanking, and Cards.
              </span>
            </div>
            
            <button
              onClick={async () => {
                if (window.confirm("Do you want to simulate trial expiry? This will set your subscription to 'TRIALING' and end date to 'yesterday' to trigger the paywall modal.")) {
                  const token = localStorage.getItem('gmb_auth_token');
                  const res = await fetch(`${API_URL}/api/subscriptions/simulate-expiry`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (res.ok) {
                    alert("Trial expiry simulated! Reloading page to trigger paywall.");
                    window.location.reload();
                  }
                }
              }}
              className="w-full mt-3 py-1.5 border border-dashed border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-xl transition-all"
            >
              Simulate Trial Expiry (Developer Testing)
            </button>
          </div>

          {/* Google Maps Profile Editing */}
          {selectedLocation && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Edit Google Maps Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Update your business location details. In Production mode, this updates your live Google Maps presence.
              </p>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Salon Beauty"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Business Category
                    </label>
                    <input
                      type="text"
                      value={profileForm.category}
                      onChange={(e) => setProfileForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="e.g. Beauty Salon"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Primary Phone
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="e.g. +91 99999 99999"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Website URI
                  </label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm(p => ({ ...p, website: e.target.value }))}
                    className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. https://yoursalon.in"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Storefront Address
                  </label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                    rows={2}
                    className="w-full bg-card border border-border text-xs rounded-xl p-3 focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="Address lines..."
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/25 disabled:opacity-50"
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Business Profile Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Row 2: Auto-Reply & Notifications */}
      {selectedLocation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Auto-Reply card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-black flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Auto-Reply Scheduler
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure automatic AI responses to incoming customer reviews on a timer.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Enable Auto-Reply</span>
                <button
                  onClick={() => setAutoReply(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    autoReply.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      autoReply.enabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Response Tone
                </label>
                <select
                  value={autoReply.tone}
                  onChange={(e) => setAutoReply(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="FRIENDLY">Friendly 👋</option>
                  <option value="PROFESSIONAL">Professional 💼</option>
                  <option value="LUXURY">Luxury Brand ✨</option>
                  <option value="HEALTHCARE">Healthcare 🩺</option>
                  <option value="RESTAURANT">Restaurant 🍕</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Min Rating
                  </label>
                  <select
                    value={autoReply.minRating}
                    onChange={(e) => setAutoReply(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                    className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Max Rating
                  </label>
                  <select
                    value={autoReply.maxRating}
                    onChange={(e) => setAutoReply(prev => ({ ...prev, maxRating: parseInt(e.target.value) }))}
                    className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Delay Before Reply (Minutes)
                </label>
                <input
                  type="number"
                  value={autoReply.delayMinutes}
                  onChange={(e) => setAutoReply(prev => ({ ...prev, delayMinutes: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveAutoReply}
                disabled={settingsLoading}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/25 disabled:opacity-50"
              >
                {settingsLoading ? 'Saving...' : 'Save Auto-Reply Settings'}
              </button>
            </div>
          </div>

          {/* Email notifications card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-black flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-primary" /> Review Email Alerts
            </h3>
            <p className="text-xs text-muted-foreground">
              Get notified immediately by email when your business receives critical/bad reviews.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Enable Email Alerts</span>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, notifyEnabled: !prev.notifyEnabled }))}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    notifications.notifyEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      notifications.notifyEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={notifications.notifyEmail}
                  onChange={(e) => setNotifications(prev => ({ ...prev, notifyEmail: e.target.value }))}
                  placeholder="alerts@yourbusiness.com"
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Alert Trigger Rating
                </label>
                <select
                  value={notifications.notifyOnRatingBelow}
                  onChange={(e) => setNotifications(prev => ({ ...prev, notifyOnRatingBelow: parseInt(e.target.value) }))}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="2">Below 2 Stars (Notify only on 1★)</option>
                  <option value="3">Below 3 Stars (Notify on 1-2★)</option>
                  <option value="4">Below 4 Stars (Notify on 1-3★)</option>
                  <option value="5">Below 5 Stars (Notify on 1-4★)</option>
                  <option value="6">All Reviews</option>
                </select>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={settingsLoading}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/25 disabled:opacity-50"
              >
                {settingsLoading ? 'Saving...' : 'Save Email Notification Settings'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-xs text-muted-foreground mt-8">
          Please select a location above to configure Auto-Reply and Notification settings.
        </div>
      )}
    </div>
  );
}
