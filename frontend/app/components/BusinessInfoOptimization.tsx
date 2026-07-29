'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Edit2, Lightbulb, Loader } from 'lucide-react';

interface OptimizationStatus {
  completenessScore: number;
  missingFields: string[];
  suggestions: string[];
  scores: {
    name: number;
    address: number;
    phone: number;
    website: number;
    hours: number;
    serviceArea: number;
    description: number;
    attributes: number;
    category: number;
  };
}

export default function BusinessInfoOptimization({ locationId }: { locationId: string }) {
  const [status, setStatus] = useState<OptimizationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newServiceArea, setNewServiceArea] = useState('');

  useEffect(() => {
    fetchStatus();
  }, [locationId]);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/locations/${locationId}/business-info/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBusinessInfo = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/locations/${locationId}/business-info/analyze`, {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze business info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addServiceArea = async () => {
    if (!newServiceArea.trim()) return;

    const updatedAreas = [...serviceAreas, newServiceArea];
    setServiceAreas(updatedAreas);
    setNewServiceArea('');

    try {
      await fetch(`/api/locations/${locationId}/business-info/service-area`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAreas: updatedAreas })
      });
    } catch (error) {
      console.error('Failed to update service areas:', error);
    }
  };

  const removeServiceArea = async (area: string) => {
    const updatedAreas = serviceAreas.filter(a => a !== area);
    setServiceAreas(updatedAreas);

    try {
      await fetch(`/api/locations/${locationId}/business-info/service-area`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAreas: updatedAreas })
      });
    } catch (error) {
      console.error('Failed to update service areas:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-6 flex justify-center items-center min-h-96">
        <Loader size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score === 100) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
            <p className="text-gray-600 mt-1">Optimize your profile for maximum visibility</p>
          </div>
          <button
            onClick={analyzeBusinessInfo}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isAnalyzing ? <Loader size={18} className="animate-spin" /> : <Edit2 size={18} />}
            Analyze Now
          </button>
        </div>

        {/* Completeness Score */}
        {status && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">Profile Completeness</p>
              <span className="text-2xl font-bold text-gray-900">{status.completenessScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(status.completenessScore)} transition-all duration-300`}
                style={{ width: `${status.completenessScore}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {status.completenessScore === 100
                ? '✓ Your profile is fully optimized!'
                : `Complete ${100 - status.completenessScore} more items to reach 100%`}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Scores */}
        <div className="lg:col-span-1">
          <h3 className="font-bold text-gray-900 mb-4">Field Scores</h3>
          <div className="space-y-3">
            {status && Object.entries(status.scores).map(([field, score]) => (
              <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 capitalize">{field}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`font-bold text-sm ${getScoreColor(score)}`}>{score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Fields & Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Missing Fields */}
          {status && status.missingFields.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 mb-2">Missing Information</h4>
                  <ul className="space-y-1">
                    {status.missingFields.map((field, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Suggestions */}
          {status && status.suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2">Optimization Tips</h4>
                  <ul className="space-y-1">
                    {status.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-blue-800">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Service Areas</h4>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
                placeholder="Add service area (e.g., New York)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                onClick={addServiceArea}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            {serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <div key={area} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {area}
                    <button
                      onClick={() => removeServiceArea(area)}
                      className="text-blue-900 hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success State */}
          {status && status.completenessScore === 100 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-900">Perfect Score!</p>
                <p className="text-sm text-green-800">Your business profile is fully optimized for maximum visibility.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
