import React, { useState, useCallback } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Image } from '../types/images';
import ImageGallery from '../components/Images/ImageGallery';
import UploadModal from '../components/Images/UploadModal';
import EditModal from '../components/Images/EditModal';

interface DashboardStats {
  totalImages: number;
  totalSize: string;
  recentUploads: number;
}

const Dashboard: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalSize: '0 MB',
    recentUploads: 0
  });

  // Memoize callbacks to prevent infinite re-renders
  const handleEditClick = useCallback((image: Image): void => {
    console.log('Edit clicked:', image.title);
    setSelectedImage(image);
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = useCallback((): void => {
    console.log('Edit successful');
    setRefreshKey(prev => prev + 1);
    setShowEditModal(false);
    setSelectedImage(null);
  }, []);

  const handleUploadSuccess = useCallback((): void => {
    console.log('Upload successful');
    setRefreshKey(prev => prev + 1);
    setShowUploadModal(false);
  }, []);

  const handleDeleteSuccess = useCallback((): void => {
    console.log('Delete successful');
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleUpdateStats = useCallback((newStats: Partial<DashboardStats>): void => {
    setStats(prev => ({ ...prev, ...newStats }));
  }, []);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Image Dashboard</h1>
            <p className="text-primary-100">
              Manage and organize your image collection
            </p>
          </div>
          <button
            onClick={() => {
              console.log("Upload button clicked!");
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <div className="text-sm text-primary-100">Total Images</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{stats.totalSize}</div>
            <div className="text-sm text-primary-100">Total Size</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <div className="text-sm text-primary-100">Recent Uploads</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Your Images</h2>
            <p className="text-gray-600">
              Drag to reorder • Click to select • Hover for actions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Upload Button */}
            <button
              onClick={() => {
                console.log("Small upload button clicked!");
                setShowUploadModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Upload</span>
            </button>
          </div>
        </div>

        {/* Image Gallery - Always grid view */}
        <div>
          <ImageGallery
            key={refreshKey}
            onEdit={handleEditClick}
            onDelete={handleDeleteSuccess}
            onStatsUpdate={handleUpdateStats}
          />
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-3">Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Drag & Drop</p>
              <p className="text-sm text-gray-600">Rearrange images by dragging</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Bulk Upload</p>
              <p className="text-sm text-gray-600">Upload multiple images at once</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Quick Select</p>
              <p className="text-sm text-gray-600">Select multiple images for batch actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Dashboard;