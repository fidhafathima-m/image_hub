import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { imagesAPI } from '../../api/images';
import toast from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [titles, setTitles] = useState([]);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (isBulkUpload) {
      setFiles(selectedFiles);
      setTitles(selectedFiles.map(file => 
        file.name.split('.')[0] || 'Untitled'
      ));
    } else {
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        setFiles([file]);
        setTitles([file.name.split('.')[0] || 'Untitled']);
      }
    }
  };

  const updateTitle = (index, value) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newTitles = [...titles];
    
    newFiles.splice(index, 1);
    newTitles.splice(index, 1);
    
    setFiles(newFiles);
    setTitles(newTitles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);

    try {
      if (isBulkUpload) {
        await imagesAPI.bulkUploadImages(files, titles);
        toast.success(`${files.length} images uploaded successfully`);
      } else {
        const formData = new FormData();
        formData.append('image', files[0]);
        formData.append('title', titles[0]);
        
        await imagesAPI.uploadImage(formData);
        toast.success('Image uploaded successfully');
      }
      
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTitles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Upload {isBulkUpload ? 'Images' : 'Image'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Mode Toggle */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setIsBulkUpload(false)}
              className={`px-4 py-2 rounded-lg ${!isBulkUpload ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Single Upload
            </button>
            <button
              type="button"
              onClick={() => setIsBulkUpload(true)}
              className={`px-4 py-2 rounded-lg ${isBulkUpload ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Bulk Upload
            </button>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {isBulkUpload ? 'Images' : 'Image'}
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select {isBulkUpload ? 'images' : 'an image'}
              </p>
              <p className="text-sm text-gray-500">
                {isBulkUpload ? 'Multiple images allowed (upto 100 images each less than 5 MB)' : 'Single image only'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={isBulkUpload}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-700">Selected Files:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={titles[index]}
                      onChange={(e) => updateTitle(index, e.target.value)}
                      className="input-field w-full"
                      placeholder="Enter title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || files.length === 0}
              className="btn-primary flex items-center space-x-2"
            >
              {uploading ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>
                {uploading ? 'Uploading...' : `Upload ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;