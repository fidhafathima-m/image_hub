import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { X, Upload, Trash2, AlertCircle } from 'lucide-react';
import { imagesAPI } from '../../api/images';
import toast from 'react-hot-toast';
import { UploadModalProps, ImageFile as UploadImageFile } from '../../types/images';
import { UPLOAD_LIMITS } from '../../utils/constants';

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
  const [showLimitError, setShowLimitError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset limit error when mode changes or files are cleared
  useEffect(() => {
    if (files.length <= UPLOAD_LIMITS.MAX_FILES) {
      setShowLimitError(false);
    }
  }, [files.length, isBulkUpload]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Check if total files would exceed limit (for bulk upload)
    const totalFilesAfterSelection = files.length + selectedFiles.length;
    
    if (isBulkUpload && totalFilesAfterSelection > UPLOAD_LIMITS.MAX_FILES) {
      setShowLimitError(true);
      toast.error(`Maximum ${UPLOAD_LIMITS.MAX_FILES} images allowed. You selected ${selectedFiles.length} images but can only add ${UPLOAD_LIMITS.MAX_FILES - files.length} more.`);
      
      // Limit selection to remaining capacity
      const allowedFiles = selectedFiles.slice(0, UPLOAD_LIMITS.MAX_FILES - files.length);
      
      if (allowedFiles.length > 0) {
        processFiles(allowedFiles);
      }
      
      // Clear the input so same files can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles: File[]): void => {
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0]?.replace(/[^a-zA-Z0-9\s]/g, ' ') || 'Untitled'
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

    // Check bulk upload limit
    if (isBulkUpload && files.length > UPLOAD_LIMITS.MAX_FILES) {
      toast.error(`Maximum ${UPLOAD_LIMITS.MAX_FILES} images allowed for bulk upload`);
      return false;
    }

    // Validate each file
    for (const fileObj of files) {
      const { file, title } = fileObj;
      
      // Validate file type
      if (!UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type as any)) {
        toast.error(`${file.name}: Only image files are allowed (JPEG, PNG, GIF, WebP)`);
        return false;
      }

      // Validate file size (5MB)
      if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
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
    setShowLimitError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  // Check if upload should be disabled
  const isUploadDisabled = uploading || 
    files.length === 0 || 
    (isBulkUpload && files.length > UPLOAD_LIMITS.MAX_FILES);

  // Tooltip message for disabled button
  const getUploadTooltip = (): string => {
    if (files.length === 0) return 'Please select at least one image';
    if (isBulkUpload && files.length > UPLOAD_LIMITS.MAX_FILES) {
      return `Maximum ${UPLOAD_LIMITS.MAX_FILES} images allowed for bulk upload`;
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Upload {isBulkUpload ? 'Images' : 'Image'}
              </h2>
              {isBulkUpload && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum {UPLOAD_LIMITS.MAX_FILES} images per bulk upload
                </p>
              )}
            </div>
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
              onClick={() => {
                setIsBulkUpload(false);
                setShowLimitError(false);
              }}
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
              Bulk Upload (Max {UPLOAD_LIMITS.MAX_FILES})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Limit Warning */}
          {showLimitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Too many images selected</p>
                <p>Maximum {UPLOAD_LIMITS.MAX_FILES} images allowed for bulk upload. Only the first {UPLOAD_LIMITS.MAX_FILES - files.length} images will be added.</p>
              </div>
            </div>
          )}

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {isBulkUpload ? 'Images' : 'Image'} (max 5MB each)
            </label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                transition-colors hover:bg-gray-50
                ${showLimitError ? 'border-red-300' : 'border-gray-300 hover:border-primary-500'}
              `}
              onClick={() => !showLimitError && fileInputRef.current?.click()}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${showLimitError ? 'text-red-400' : 'text-gray-400'}`} />
              <p className={`mb-2 ${showLimitError ? 'text-red-600' : 'text-gray-600'}`}>
                {showLimitError 
                  ? `Maximum ${UPLOAD_LIMITS.MAX_FILES} images reached` 
                  : `Click to select ${isBulkUpload ? 'images' : 'an image'}`}
              </p>
              <p className="text-sm text-gray-500">
                {isBulkUpload 
                  ? `Multiple images (up to ${UPLOAD_LIMITS.MAX_FILES} images) allowed (JPEG, PNG, GIF, WebP)` 
                  : 'Single image only (JPEG, PNG, GIF, WebP)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={isBulkUpload}
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || (isBulkUpload && files.length >= UPLOAD_LIMITS.MAX_FILES)}
              />
            </div>
            
            {/* File counter */}
            {isBulkUpload && files.length > 0 && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {files.length} of {UPLOAD_LIMITS.MAX_FILES} images selected
                </span>
                {files.length >= UPLOAD_LIMITS.MAX_FILES && (
                  <span className="text-sm text-red-600 font-medium">
                    Limit reached
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">
                  Selected Files ({files.length})
                </h3>
                {isBulkUpload && (
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                    disabled={uploading}
                  >
                    Clear All
                  </button>
                )}
              </div>
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
                        maxLength={50}
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
            <div className="relative group">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploadDisabled}
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
              
              {/* Tooltip for disabled button */}
              {isUploadDisabled && getUploadTooltip() && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {getUploadTooltip()}
                    <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;