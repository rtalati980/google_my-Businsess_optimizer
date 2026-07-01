'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { Users, Search, Filter, AlertTriangle, Loader2, TrendingUp, DollarSign } from 'lucide-react';

export default function CustomersPage() {
  const { selectedLocation } = useDashboard();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    fetchCustomers();
  }, [selectedLocation]);

  const fetchCustomers = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getCustomersList(selectedLocation.id);
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.contactPhone?.includes(searchTerm);
    const matchesRisk = filterRisk === 'ALL' || c.churnRisk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Customer Profiles
          </h1>
          <p className="text-gray-600 mt-2">Manage and analyze all your customers in one place</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Customers</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No customers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">LTV</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Churn Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.contactName}</div>
                      <div className="text-sm text-gray-500">{customer.totalInteractions || 0} interactions</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{customer.contactEmail}</div>
                      <div>{customer.contactPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="font-bold text-sm text-gray-900">{customer.engagementScore || 0}</span>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${customer.engagementScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-gray-900">${(customer.estimatedLifetimeValue || 0).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Lifetime value</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskColor(customer.churnRisk)}`}>
                        {customer.churnRisk === 'HIGH' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {customer.churnRisk || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {filteredCustomers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium">Total Customers</div>
                  <div className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium">Average LTV</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(filteredCustomers.reduce((sum, c) => sum + (c.estimatedLifetimeValue || 0), 0) / filteredCustomers.length).toFixed(0)}
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium">At Risk</div>
                  <div className="text-2xl font-bold text-red-600">
                    {filteredCustomers.filter(c => c.churnRisk === 'HIGH').length}
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
