'use client';

import { useState } from 'react';
import PhotoGallery from '@/components/PhotoGallery';
import QADashboard from '@/components/QADashboard';
import BusinessInfoOptimization from '@/components/BusinessInfoOptimization';
import KeywordsDashboard from '@/components/KeywordsDashboard';
import { Image, MessageSquare, CheckCircle, Target } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function LocationDashboard({ params }: PageProps) {
  const locationId = params.id;
  const [activeTab, setActiveTab] = useState('photos');

  const tabs = [
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'qa', label: 'Q&A', icon: MessageSquare },
    { id: 'business', label: 'Business Info', icon: CheckCircle },
    { id: 'keywords', label: 'Keywords', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Growth Optimization Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage all aspects of your Google Business Profile to attract more customers</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'photos' && <PhotoGallery locationId={locationId} />}
        {activeTab === 'qa' && <QADashboard locationId={locationId} />}
        {activeTab === 'business' && <BusinessInfoOptimization locationId={locationId} />}
        {activeTab === 'keywords' && <KeywordsDashboard locationId={locationId} />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💡 Pro Tips</h3>
              <p className="text-sm text-gray-600">Upload high-quality photos to increase click-through rates by up to 40%</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">⚡ Quick Win</h3>
              <p className="text-sm text-gray-600">Answer all customer questions within 24 hours to build trust</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🎯 Focus</h3>
              <p className="text-sm text-gray-600">Keep your business information 100% complete for maximum visibility</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📈 Growth</h3>
              <p className="text-sm text-gray-600">Track keywords to see which searches bring you customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
