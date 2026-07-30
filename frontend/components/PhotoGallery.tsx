'use client';

import { useState } from 'react';
import { Upload, Trash2, Share2, Eye, Download } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  qualityScore: number;
  suggestedCaption: string;
  status: string;
  views: number;
  clicks: number;
  uploadedAt: string;
}

export default function PhotoGallery({ locationId }: { locationId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'OTHER'
  });

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.imageUrl) {
      alert('Title and image URL required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/locations/${locationId}/photos/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData)
      });
      const newPhoto = await response.json();
      setPhotos([newPhoto, ...photos]);
      setShowUploadModal(false);
      setUploadData({ title: '', description: '', imageUrl: '', category: 'OTHER' });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setIsLoading(false);
    }
  };

  const publishPhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/locations/${locationId}/photos/${photoId}/publish`, {
        method: 'POST'
      });
      const updated = await response.json();
      setPhotos(photos.map(p => p.id === photoId ? updated : p));
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await fetch(`/api/locations/${locationId}/photos/${photoId}`, {
        method: 'DELETE'
      });
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
          <p className="text-gray-600 mt-1">Manage your business photos for Google visibility</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Upload size={20} />
          Upload Photo
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Photo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fresh Pizza Oven"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Photo description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={uploadData.imageUrl}
                  onChange={(e) => setUploadData({ ...uploadData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>INTERIOR</option>
                  <option>EXTERIOR</option>
                  <option>PRODUCT</option>
                  <option>TEAM</option>
                  <option>FOOD</option>
                  <option>OTHER</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No photos yet. Upload your first photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              {/* Image */}
              <div className="relative w-full h-40 bg-gray-100">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover"
                />
                {/* Quality Badge */}
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                  Quality: {photo.qualityScore}/100
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{photo.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{photo.description}</p>

                {/* Status Badge */}
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    photo.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {photo.status}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {photo.category}
                  </span>
                </div>

                {/* AI Caption */}
                {photo.suggestedCaption && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-gray-600 font-medium">AI Caption:</p>
                    <p className="text-sm text-gray-700 mt-1">{photo.suggestedCaption}</p>
                  </div>
                )}

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-2 border-t border-gray-200">
                  <div className="text-center">
                    <Eye size={16} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-medium text-gray-900">{photo.views}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div className="text-center">
                    <Share2 size={16} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-medium text-gray-900">{photo.clicks}</p>
                    <p className="text-xs text-gray-600">Clicks</p>
                  </div>
                  <div className="text-center">
                    <Download size={16} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-medium text-gray-900">{Math.round((photo.clicks / (photo.views || 1)) * 100)}%</p>
                    <p className="text-xs text-gray-600">CTR</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {photo.status === 'DRAFT' && (
                    <button
                      onClick={() => publishPhoto(photo.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
