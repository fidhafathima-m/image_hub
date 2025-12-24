import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { imagesAPI } from '../../api/images';
import toast from 'react-hot-toast';

const EditModal = ({ isOpen, onClose, image, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (image) {
      setTitle(image.title);
      setPreview(imagesAPI.getImageUrl(image.fileName));
      setFile(null);
    }
  }, [image]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUpdating(true);

    try {
      await imagesAPI.updateImage(image._id, {
        title,
        image: file
      });
      
      toast.success('Image updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Preview */}
          <div className="text-center">
            <div className="inline-block relative">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
                {preview ? (
                  <img
                    src={preview}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
              >
                <ImageIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              Click the icon to change image
            </p>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter image title"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="btn-primary flex items-center space-x-2"
            >
              {updating ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : null}
              <span>{updating ? 'Updating...' : 'Update Image'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;