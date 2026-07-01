'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import {
  MessageSquare, Sparkles, AlertCircle, Loader2,
  Send, Plus, Trash2, Eye, TrendingUp
} from 'lucide-react';

export default function ReviewCampaignsPage() {
  const { selectedLocation } = useDashboard();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState('');
  const [requestType, setRequestType] = useState('SMS');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const fetchRequests = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const [reqs, st] = await Promise.all([
        apiService.getReviewRequests(selectedLocation.id),
        apiService.getReviewRequestStats(selectedLocation.id),
      ]);
      setRequests(reqs);
      setStats(st);
    } catch (err) {
      console.error('Error fetching review requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedLocation]);

  const parseCustomers = () => {
    const lines = customers.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0],
        phone: parts[1] || '',
        email: parts[2] || '',
      };
    }).filter(c => c.name);
  };

  const handleGenerateMessages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    const parsedCustomers = parseCustomers();
    if (parsedCustomers.length === 0) {
      alert('Please enter at least one customer');
      return;
    }

    try {
      setGenerating(true);
      await apiService.generateReviewRequests(selectedLocation.id, parsedCustomers, requestType);
      setCustomers('');
      setShowForm(false);
      await fetchRequests();
    } catch (err) {
      console.error('Error generating messages:', err);
      alert('Failed to generate review requests');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendRequests = async () => {
    if (selectedRequests.length === 0) {
      alert('Please select at least one request to send');
      return;
    }

    try {
      setSending(true);
      await apiService.sendReviewRequests(selectedLocation!.id, selectedRequests);
      setSelectedRequests([]);
      await fetchRequests();
    } catch (err) {
      console.error('Error sending requests:', err);
      alert('Failed to send review requests');
    } finally {
      setSending(false);
    }
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const selectAll = () => {
    if (selectedRequests.length === requests.filter(r => r.status === 'PENDING').length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.filter(r => r.status === 'PENDING').map(r => r.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Campaigns</h1>
              <p className="text-gray-600">Generate and send personalized review requests</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium mb-2">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium mb-2">Sent</div>
              <div className="text-3xl font-bold text-blue-600">{stats.sentRequests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium mb-2">Responded</div>
              <div className="text-3xl font-bold text-green-600">{stats.respondedRequests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium mb-2">Completed</div>
              <div className="text-3xl font-bold text-emerald-600">{stats.completedRequests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</div>
              <div className="text-3xl font-bold text-purple-600">{stats.conversionRate}</div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Review Requests</h2>
            <form onSubmit={handleGenerateMessages} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Channel
                </label>
                <div className="flex gap-4">
                  {['SMS', 'EMAIL', 'WHATSAPP'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        checked={requestType === type}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customers (Name, Phone, Email - one per line)
                </label>
                <textarea
                  value={customers}
                  onChange={(e) => setCustomers(e.target.value)}
                  placeholder="John Doe, 9876543210, john@example.com&#10;Jane Smith, 9123456789, jane@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">Format: Name, Phone, Email (separated by commas)</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate Messages
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Review Requests</h2>
              {selectedRequests.length > 0 && (
                <button
                  onClick={handleSendRequests}
                  disabled={sending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send {selectedRequests.length} Selected
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No review requests yet. Create your first campaign!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === requests.filter(r => r.status === 'PENDING').length && requests.some(r => r.status === 'PENDING')}
                        onChange={selectAll}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {request.status === 'PENDING' && (
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => toggleRequestSelection(request.id)}
                            className="w-4 h-4 rounded"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{request.customerName}</div>
                        <div className="text-sm text-gray-500">{request.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.customerPhone}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {request.requestType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          request.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                          request.status === 'RESPONDED' ? 'bg-green-100 text-green-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
