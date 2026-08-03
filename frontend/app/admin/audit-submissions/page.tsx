'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Mail, MapPin, Building2, Clock } from 'lucide-react';

interface Submission {
  _id: string;
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  city: string;
  created_at: string;
  status: 'new' | 'audit_generated' | 'email_sent' | 'contacted';
}

interface Analytics {
  total: number;
  recentCount: number;
  byStatus: Array<{ _id: string; count: number }>;
  byBusinessType: Array<{ _id: string; count: number }>;
  byCity: Array<{ _id: string; count: number }>;
}

export default function AuditSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'email_sent'>('all');

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/audit-submissions?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setSubmissions(data.submissions || []);
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      audit_generated: 'bg-green-100 text-green-800',
      email_sent: 'bg-purple-100 text-purple-800',
      contacted: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.new;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Audit Submissions</h1>
          <p className="text-gray-600">Track and manage free audit requests from your landing page</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Submissions</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{analytics.total}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Last 7 Days</p>
                  <p className="text-3xl font-black text-green-600 mt-2">{analytics.recentCount}</p>
                </div>
                <Clock className="h-12 w-12 text-green-500 opacity-20" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">New Leads</p>
                  <p className="text-3xl font-black text-purple-600 mt-2">
                    {analytics.byStatus.find(s => s._id === 'new')?.count || 0}
                  </p>
                </div>
                <Mail className="h-12 w-12 text-purple-500 opacity-20" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Top City</p>
                  <p className="text-xl font-black text-orange-600 mt-2">
                    {analytics.byCity[0]?._id || 'N/A'}
                  </p>
                </div>
                <MapPin className="h-12 w-12 text-orange-500 opacity-20" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {(['all', 'new', 'email_sent'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status === 'new' ? 'New' : 'Contacted'}
            </button>
          ))}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-600">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map(submission => (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {submission.business_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                          {submission.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a href={`tel:${submission.phone}`} className="text-blue-600 hover:underline">
                          {submission.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-semibold">
                          {submission.business_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{submission.city}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(submission.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Business Type Breakdown */}
        {analytics && analytics.byBusinessType.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Submissions by Business Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.byBusinessType.map(item => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
