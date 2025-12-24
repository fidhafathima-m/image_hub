import React, { useState } from 'react';
import ImageGallery from '../components/Images/ImageGallery';
import UploadModal from '../components/Images/UploadModal';
import EditModal from '../components/Images/EditModal';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = (image) => {
    setSelectedImage(image);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowEditModal(false);
    setSelectedImage(null);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Image Gallery */}
      <ImageGallery key={refreshKey} onEdit={handleEditClick} />

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