import React, { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { imagesAPI } from '../../api/images';
import toast from 'react-hot-toast';
import { UploadModalProps, ImageFile as UploadImageFile } from '../../types/images';

interface UploadFile {
  file: File;
  preview: string;
  title: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isBulkUpload, setIsBulkUpload] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0] || 'Untitled'
    }));

    if (isBulkUpload) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // Clear previous files for single upload
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles(newFiles.slice(0, 1)); // Only keep first file
    }
  };

  const updateTitle = (index: number, value: string): void => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, title: value } : file
    ));
  };

  const removeFile = (index: number): void => {
    URL.revokeObjectURL(files[index].preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateFiles = (): boolean => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return false;
    }

    // Validate each file
    for (const fileObj of files) {
      const { file, title } = fileObj;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only image files are allowed (JPEG, PNG, GIF, WebP)`);
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 5MB`);
        return false;
      }

      // Validate title
      if (!title.trim()) {
        toast.error('Please enter a title for all images');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateFiles()) return;

    setUploading(true);

    try {
      if (isBulkUpload) {
        const fileArray = files.map(f => f.file);
        const titles = files.map(f => f.title);
        await imagesAPI.bulkUploadImages(fileArray, titles);
        toast.success(`${files.length} images uploaded successfully`);
      } else {
        const formData = new FormData();
        formData.append('image', files[0].file);
        formData.append('title', files[0].title);
        
        await imagesAPI.uploadImage(formData);
        toast.success('Image uploaded successfully');
      }
      
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = (): void => {
    // Clean up object URLs
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-bold text-gray-800">
              Upload {isBulkUpload ? 'Images' : 'Image'}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={uploading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Upload Mode Toggle */}
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setIsBulkUpload(false)}
              className={`flex-1 py-3 text-center ${!isBulkUpload ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              disabled={uploading}
            >
              Single Upload
            </button>
            <button
              type="button"
              onClick={() => setIsBulkUpload(true)}
              className={`flex-1 py-3 text-center ${isBulkUpload ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              disabled={uploading}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {isBulkUpload ? 'Images' : 'Image'} (max 5MB each)
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select {isBulkUpload ? 'images' : 'an image'} or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                {isBulkUpload 
                  ? 'Multiple images allowed (JPEG, PNG, GIF, WebP)' 
                  : 'Single image only (JPEG, PNG, GIF, WebP)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={isBulkUpload}
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-700">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {files.map((fileObj, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.title}
                      className="h-16 w-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate">{fileObj.file.name}</p>
                      <input
                        type="text"
                        value={fileObj.title}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        className="input-field w-full mt-1"
                        placeholder="Enter title"
                        disabled={uploading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                      disabled={uploading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || files.length === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>
                {uploading 
                  ? 'Uploading...' 
                  : `Upload ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;