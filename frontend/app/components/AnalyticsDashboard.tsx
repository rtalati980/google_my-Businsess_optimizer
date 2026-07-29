'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Eye, MousePointer, Globe, Device,
  MapPin, Activity, Share2, Calendar, Loader, Download
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${dateRange.startDate}-${dateRange.endDate}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-12 flex justify-center items-center">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Sessions',
      value: metrics?.traffic?.totalSessions || 0,
      trend: '↑ 12%',
      icon: <Activity size={24} />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Active Users',
      value: metrics?.users?.totalActiveUsers || 0,
      trend: '↑ 8%',
      icon: <Users size={24} />,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Page Views',
      value: metrics?.traffic?.totalPageViews || 0,
      trend: '↑ 15%',
      icon: <Eye size={24} />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Conversions',
      value: metrics?.conversions?.totalConversions || 0,
      trend: '↑ 22%',
      icon: <MousePointer size={24} />,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-2">Track your app's performance and user behavior</p>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="self-end px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {metricCards.map((card, idx) => (
          <div key={idx} className={`border ${card.color} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value.toLocaleString()}</p>
              </div>
              <div className="text-gray-400">{card.icon}</div>
            </div>
            {card.trend && (
              <p className="text-sm text-green-600 font-medium mt-2">{card.trend}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-8">
          {['overview', 'traffic', 'users', 'conversions', 'devices', 'locations', 'sources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-medium transition capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Trend */}
              {metrics?.traffic?.dailyData && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Daily Traffic Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.traffic.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pageViews" stroke="#2563eb" name="Page Views" />
                      <Line type="monotone" dataKey="sessions" stroke="#16a34a" name="Sessions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Conversion Goals */}
              {metrics?.conversions?.goals && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Conversion Goals</h3>
                  <div className="space-y-3">
                    {metrics.conversions.goals.map((goal: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900">{goal.goal}</p>
                          <span className="text-sm font-bold text-green-600">{goal.conversionRate}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div
                            className="bg-green-600 h-2 rounded"
                            style={{ width: `${parseFloat(goal.conversionRate)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{goal.completions} completions</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Traffic */}
        {activeTab === 'traffic' && metrics?.traffic?.dailyData && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Traffic Metrics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={metrics.traffic.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pageViews" fill="#2563eb" name="Page Views" />
                <Bar dataKey="sessions" fill="#16a34a" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && metrics?.users?.dailyData && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">User Activity</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={metrics.users.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" stroke="#8b5cf6" name="Active Users" />
                <Line type="monotone" dataKey="newUsers" stroke="#f59e0b" name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversions */}
        {activeTab === 'conversions' && metrics?.conversions?.goals && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              {metrics.conversions.goals.map((goal: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{goal.goal}</p>
                      <p className="text-sm text-gray-600">{goal.completions} completions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{goal.conversionRate}</p>
                      <p className="text-xs text-gray-600">conversion rate</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${parseFloat(goal.conversionRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices */}
        {activeTab === 'devices' && metrics?.sources && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Device */}
            {metrics.sources.byDevice && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Traffic by Device</h3>
                <div className="space-y-3">
                  {metrics.sources.byDevice.map((device: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{device.device}</p>
                          <p className="text-sm text-gray-600">{device.sessions} sessions</p>
                        </div>
                        <p className="text-sm font-bold text-blue-600">{device.conversionRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Browser */}
            {metrics.sources.byBrowser && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Traffic by Browser</h3>
                <div className="space-y-3">
                  {metrics.sources.byBrowser.map((browser: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{browser.browser}</p>
                          <p className="text-sm text-gray-600">{browser.sessions} sessions</p>
                        </div>
                        <p className="text-sm font-bold text-gray-600">{browser.bounceRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Locations */}
        {activeTab === 'locations' && metrics?.sources && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Country */}
            {metrics.sources.byCountry && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {metrics.sources.byCountry.map((country: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{country.country}</p>
                          <p className="text-sm text-gray-600">{country.sessions} sessions</p>
                        </div>
                        <p className="text-sm font-bold text-green-600">{country.conversionRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By City */}
            {metrics.sources.byCity && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Top Cities</h3>
                <div className="space-y-3">
                  {metrics.sources.byCity.map((city: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{city.city}</p>
                          <p className="text-sm text-gray-600">{city.sessions} sessions</p>
                        </div>
                        <p className="text-sm font-bold text-green-600">{city.conversionRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {activeTab === 'sources' && metrics?.sources?.channels && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {metrics.sources.channels.map((channel: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{channel.channel}</p>
                      <p className="text-sm text-gray-600">{channel.sessions} sessions • {channel.users} users</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">{channel.conversionRate}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${Math.min(parseFloat(channel.conversionRate) * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
