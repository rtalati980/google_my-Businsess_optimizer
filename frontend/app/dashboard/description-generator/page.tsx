'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Download, RefreshCw, Heart, Trash2, Search, Loader, ChevronDown } from 'lucide-react';
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

export default function DescriptionGeneratorPage() {
  const { user } = useDashboard();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessCategory: '',
    primaryService: '',
    secondaryServices: [],
    city: '',
    area: '',
    state: '',
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
  const [searchQuery, setSearchQuery] = useState('');

  // Load auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('gmb_auth_token') : '';

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      if (!token) return;

      const response = await fetch('/api/descriptions/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
            AI Description Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate SEO-optimized business descriptions for any industry in seconds
          </p>
        </div>

        {/* Main Layout: Form + Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* FORM SECTION */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Business Details
            </h2>

            <div className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g., The Italian Kitchen"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    placeholder="e.g., Restaurant"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Primary Service *
                  </label>
                  <input
                    type="text"
                    name="primaryService"
                    value={formData.primaryService}
                    onChange={handleInputChange}
                    placeholder="e.g., Pizza"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Services (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.secondaryServices.join(', ')}
                  onChange={(e) => handleArrayInput('secondaryServices', e.target.value)}
                  placeholder="e.g., Pasta, Wine, Desserts"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Mumbai"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., Andheri"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., Maharashtra"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
              </div>

              {/* Row 6 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Customers
                </label>
                <textarea
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleInputChange}
                  placeholder="Describe your ideal customer"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
                />
              </div>

              {/* Row 7 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Unique Selling Points (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.uniqueSellingPoints.join(', ')}
                  onChange={(e) => handleArrayInput('uniqueSellingPoints', e.target.value)}
                  placeholder="e.g., Award-winning chef, Organic ingredients, Family-owned"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Row 8 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => handleArrayInput('keywords', e.target.value)}
                  placeholder="e.g., authentic, Italian, fine dining"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Row 9 */}
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
                    <option>Friendly</option>
                    <option>Professional</option>
                    <option>Luxury</option>
                    <option>Premium</option>
                    <option>Modern</option>
                    <option>Local</option>
                    <option>Family</option>
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
                    <option>Call Now</option>
                    <option>Book Today</option>
                    <option>Visit Us</option>
                    <option>Schedule Appointment</option>
                    <option>Website</option>
                    <option>None</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg text-sm">
                  {error}
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
                    Generating...
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

          {/* OUTPUT SECTION */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Generated Content
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
                  <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-200 line-clamp-2">
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

                {/* Quality Score */}
                {result.analysis.quality?.overall && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Score</h3>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${result.analysis.quality.overall}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.analysis.quality.overall}/100
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <p>Fill in your business details and click "Generate Description" to create your content</p>
              </div>
            )}
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Generation History</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              />
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {history.length} generations
            </span>
          </div>

          {showHistory && (
            <>
              {/* Search */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* History List */}
              {history.length > 0 ? (
                <div className="grid gap-4">
                  {history
                    .filter(
                      item =>
                        item.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.businessCategory.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(item => (
                      <div
                        key={item._id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {item.businessName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.businessCategory} • {item.city} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            {item.qualityScore && (
                              <p className="text-xs text-gray-500 mt-1">
                                Quality: {item.qualityScore}/100
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setResult({
                                id: item._id,
                                descriptions: {
                                  title: item.seoTitle || '',
                                  long: item.longDescription || '',
                                  extraLong: item.extraLongDescription || '',
                                },
                                analysis: {
                                  keywords: item.topKeywordsUsed || [],
                                  categories: item.suggestedCategories || [],
                                  hashtags: item.suggestedHashtags || [],
                                  quality: item.qualityMetrics || {},
                                },
                              })}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              title="View"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteFromHistory(item._id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No generations yet. Create your first description above!
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
