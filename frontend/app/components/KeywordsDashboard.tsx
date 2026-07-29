'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, Loader, Target } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  currentRank: number | null;
  rankTrend: string;
  rankChange: number;
  monthlySearchVolume: number;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  keywordType: string;
  difficulty: string;
}

interface Analytics {
  totalKeywords: number;
  rankedKeywords: number;
  topTenKeywords: number;
  topThreeKeywords: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
}

export default function KeywordsDashboard({ locationId }: { locationId: string }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    keywordType: 'LOCAL',
    intent: 'COMMERCIAL'
  });

  useEffect(() => {
    fetchData();
  }, [locationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [keywordsRes, analyticsRes] = await Promise.all([
        fetch(`/api/locations/${locationId}/keywords?page=0&size=50`),
        fetch(`/api/locations/${locationId}/keywords/analytics`)
      ]);

      const keywordsData = await keywordsRes.json();
      const analyticsData = await analyticsRes.json();

      setKeywords(keywordsData.content || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.keyword.trim()) {
      alert('Please enter a keyword');
      return;
    }

    try {
      const response = await fetch(`/api/locations/${locationId}/keywords/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyword)
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewKeyword({ keyword: '', keywordType: 'LOCAL', intent: 'COMMERCIAL' });
        fetchData();
      } else {
        alert('Keyword already being tracked');
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
      alert('Failed to add keyword');
    }
  };

  const deleteKeyword = async (keywordId: string) => {
    if (!confirm('Remove this keyword?')) return;

    try {
      await fetch(`/api/locations/${locationId}/keywords/${keywordId}`, {
        method: 'DELETE'
      });
      setKeywords(keywords.filter(k => k.id !== keywordId));
    } catch (error) {
      console.error('Failed to delete keyword:', error);
    }
  };

  const getRankBadgeColor = (rank: number | null) => {
    if (rank === null) return 'bg-gray-100 text-gray-700';
    if (rank <= 3) return 'bg-green-100 text-green-700';
    if (rank <= 10) return 'bg-blue-100 text-blue-700';
    if (rank <= 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getRankLabel = (rank: number | null) => {
    if (rank === null) return 'Not Ranked';
    if (rank === 1) return '🥇 #1';
    if (rank === 2) return '🥈 #2';
    if (rank === 3) return '🥉 #3';
    return `#${rank}`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'DOWN') return <TrendingDown size={16} className="text-red-600" />;
    return <span className="text-gray-400">→</span>;
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (a.currentRank === null) return 1;
    if (b.currentRank === null) return -1;
    return (a.currentRank || 999) - (b.currentRank || 999);
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Keyword Rankings</h2>
          <p className="text-gray-600 mt-1">Track and improve your local search visibility</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Keyword
        </button>
      </div>

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Keyword to Track</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Keyword *</label>
                <input
                  type="text"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., pizza delivery near me"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Type</label>
                <select
                  value={newKeyword.keywordType}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keywordType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="LOCAL">Local</option>
                  <option value="BRANDED">Branded</option>
                  <option value="PRODUCT_SERVICE">Product/Service</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Intent</label>
                <select
                  value={newKeyword.intent}
                  onChange={(e) => setNewKeyword({ ...newKeyword, intent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INFORMATIONAL">Informational</option>
                  <option value="NAVIGATIONAL">Navigational</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addKeyword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 font-medium">Total Keywords</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalKeywords}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 font-medium">Top 10</p>
            <p className="text-2xl font-bold text-green-600">{analytics.topTenKeywords}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 font-medium">Top 3</p>
            <p className="text-2xl font-bold text-purple-600">{analytics.topThreeKeywords}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-600 font-medium">Avg CTR</p>
            <p className="text-2xl font-bold text-orange-600">{analytics.averageCTR.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Keywords Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size={32} className="animate-spin text-blue-600" />
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No keywords tracked yet. Add your first keyword!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-900">Keyword</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Rank</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Change</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Volume</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Clicks</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">CTR</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedKeywords.map((keyword) => (
                <tr key={keyword.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{keyword.keyword}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {keyword.keywordType}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded font-bold text-sm ${getRankBadgeColor(keyword.currentRank)}`}>
                      {getRankLabel(keyword.currentRank)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(keyword.rankTrend)}
                      {keyword.rankChange ? (
                        <span className={keyword.rankChange < 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {Math.abs(keyword.rankChange)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <p className="font-medium text-gray-900">{keyword.monthlySearchVolume}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <p className="font-medium text-gray-900">{keyword.clicks}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <p className="font-medium text-gray-900">{keyword.clickThroughRate.toFixed(1)}%</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => deleteKeyword(keyword.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
