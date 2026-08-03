'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Download, RefreshCw, Trash2, Search, Loader, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/app/dashboard/layout';

interface FormData {
  businessName: string;
  businessCategory: string;
  primaryService: string;
  secondaryServices: string[];
  city: string;
  area: string;
  state: string;
  targetCustomers: string;
  yearsInBusiness: number;
  uniqueSellingPoints: string[];
  keywords: string[];
  tone: 'Friendly' | 'Professional' | 'Luxury' | 'Premium' | 'Modern' | 'Local' | 'Family';
  cta: 'Call Now' | 'Book Today' | 'Visit Us' | 'Schedule Appointment' | 'Website' | 'None';
  language: 'English' | 'Hindi';
  includeLong: boolean;
  includeExtraLong: boolean;
}

interface GenerationResult {
  id: string;
  descriptions: {
    title: string;
    long: string;
    extraLong: string;
  };
  analysis: {
    keywords: string[];
    categories: string[];
    hashtags: string[];
    quality: Record<string, number>;
  };
}

// Dropdown options
const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Cafe & Coffee Shop',
  'Bar & Pub',
  'Fast Food',
  'Pizza Restaurant',
  'Indian Restaurant',
  'Italian Restaurant',
  'Chinese Restaurant',

  'Dermatology Clinic',
  'General Hospital',
  'Dental Clinic',
  'Physiotherapy',
  'Ayurveda Clinic',
  'Eye Care',
  'Hair Transplant',

  'Hair Salon',
  'Beauty Salon',
  'Spa & Massage',
  'Gym & Fitness',
  'Yoga Studio',

  'Web Development Company',
  'App Development',
  'Digital Marketing Agency',
  'IT Services',
  'Software Development',
  'UI/UX Design',

  'Real Estate Agency',
  'Property Dealer',
  'Retail Store',
  'Clothing Shop',
  'Electronics Store',
  'Grocery Store',
  'Pharmacy',
];

const PRIMARY_SERVICES: Record<string, string[]> = {
  'Restaurant': ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Seafood', 'Pizza', 'Pasta'],
  'Cafe & Coffee Shop': ['Coffee', 'Tea', 'Pastries', 'Desserts', 'Light Meals'],
  'Dermatology Clinic': ['Acne Treatment', 'Hair Loss Treatment', 'Skin Aging', 'Laser Therapy', 'Cosmetic Surgery'],
  'Hair Salon': ['Hair Cut', 'Hair Color', 'Hair Treatment', 'Keratin', 'Scalp Treatment'],
  'Web Development Company': ['Website Design', 'E-commerce', 'Web Apps', 'API Development', 'Responsive Design'],
  'Gym & Fitness': ['Weight Training', 'Cardio', 'CrossFit', 'Yoga', 'Personal Training'],
  'Real Estate Agency': ['Residential', 'Commercial', 'Rental', 'Resale', 'Property Management'],
  'Pharmacy': ['Medicines', 'Health Products', 'Vaccination', 'Diagnostic Tests'],
};

const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Kochi',
  'Surat',
  'Vadodara',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Goa',
  'Gurgaon',
  'Noida',
  'Greater Noida',
];

const TONES = ['Friendly', 'Professional', 'Luxury', 'Premium', 'Modern', 'Local', 'Family'];
const CTAS = ['Call Now', 'Book Today', 'Visit Us', 'Schedule Appointment', 'Website', 'None'];

export default function ImprovedDescriptionGeneratorPage() {
  const { user } = useDashboard();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessCategory: '',
    primaryService: '',
    secondaryServices: [],
    city: '',
    area: '',
    state: 'Maharashtra',
    targetCustomers: '',
    yearsInBusiness: 1,
    uniqueSellingPoints: [],
    keywords: [],
    tone: 'Professional',
    cta: 'Call Now',
    language: 'English',
    includeLong: true,
    includeExtraLong: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gmb_auth_token') : '';

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      if (!token) return;
      const response = await fetch('/api/descriptions/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      businessCategory: category,
      primaryService: '',
      secondaryServices: [],
    }));
  }

  function handlePrimaryServiceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      primaryService: e.target.value,
    }));
  }

  function toggleSecondaryService(service: string) {
    setFormData(prev => {
      const services = prev.secondaryServices.includes(service)
        ? prev.secondaryServices.filter(s => s !== service)
        : [...prev.secondaryServices, service];
      return { ...prev, secondaryServices: services };
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseInt(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  }

  function handleArrayInput(field: keyof FormData, value: string) {
    const items = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  }

  async function generateDescription() {
    if (!token) {
      setError('Please log in to generate descriptions');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.[0] || errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function deleteFromHistory(id: string) {
    try {
      const response = await fetch(`/api/descriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        loadHistory();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  function downloadAsText(text: string, filename: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const availablePrimaryServices = formData.businessCategory
    ? PRIMARY_SERVICES[formData.businessCategory] || []
    : [];

  const validationErrors = [];
  if (!formData.businessName) validationErrors.push('Business name');
  if (!formData.businessCategory) validationErrors.push('Business category');
  if (!formData.primaryService) validationErrors.push('Primary service');
  if (!formData.city) validationErrors.push('City');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            ✨ AI Description Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate SEO-optimized descriptions in seconds (dropdowns make it easy!)
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* FORM */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Info</h2>

            <div className="space-y-5">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g., CodeCrafters360"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Category * (Easy Selection!)
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Category --</option>
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Service Dropdown */}
              {availablePrimaryServices.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Primary Service * (Auto-loaded!)
                  </label>
                  <select
                    value={formData.primaryService}
                    onChange={handlePrimaryServiceChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Service --</option>
                    {availablePrimaryServices.map(service => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Secondary Services - Checkboxes */}
              {availablePrimaryServices.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Secondary Services (Check any):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePrimaryServices.map(service => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.secondaryServices.includes(service)}
                          onChange={() => toggleSecondaryService(service)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* City Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select City --</option>
                  {INDIAN_CITIES.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Area (Optional)
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., Andheri West"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Years in Business */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Years in Business
                </label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Target Customers */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Customers
                </label>
                <textarea
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleInputChange}
                  placeholder="Describe your ideal customer"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-16"
                />
              </div>

              {/* Quick Input Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Unique Selling Points (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.uniqueSellingPoints.join(', ')}
                  onChange={(e) => handleArrayInput('uniqueSellingPoints', e.target.value)}
                  placeholder="e.g., Award-winning, Fast delivery, 24/7 support"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => handleArrayInput('keywords', e.target.value)}
                  placeholder="e.g., web development, custom website, affordable"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tone & CTA Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TONES.map(tone => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Call-to-Action
                  </label>
                  <select
                    name="cta"
                    value={formData.cta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CTAS.map(cta => (
                      <option key={cta} value={cta}>
                        {cta}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateDescription}
                disabled={loading || validationErrors.length > 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Generating... (10-20s)
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Generate Description
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OUTPUT */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📝 Generated Content
            </h2>

            {result ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">SEO Title</h3>
                    <button
                      onClick={() => copyToClipboard(result.descriptions.title, 'title')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-200">
                    {result.descriptions.title}
                  </p>
                </div>

                {/* Long Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">500-Word Description</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(result.descriptions.long, 'long')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadAsText(result.descriptions.long, 'description-500.txt')}
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded h-48 overflow-y-auto text-sm text-gray-900 dark:text-gray-200 leading-relaxed">
                    {result.descriptions.long}
                  </div>
                </div>

                {/* Quality Score */}
                {result.analysis.quality?.overall && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Quality Score: {result.analysis.quality.overall}/100
                    </h3>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${result.analysis.quality.overall}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {result.analysis.keywords?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Top Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.keywords.slice(0, 10).map((kw, i) => (
                        <span key={i} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <p>👆 Fill form and click "Generate" to create your SEO description</p>
              </div>
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📚 Generation History
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {history.length} generated
            </span>
          </div>

          {showHistory && history.length > 0 && (
            <div className="grid gap-3">
              {history.map(item => (
                <div
                  key={item._id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.businessName}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.businessCategory} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFromHistory(item._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
