import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { imagesAPI } from '../../api/images';
import toast from 'react-hot-toast';
import { EditModalProps, Image } from '../../types/images';

const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  image, 
  onSuccess 
}) => {
  const [title, setTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      setTitle(image.title);
      setPreview(imagesAPI.getImageUrl(image));
      setFile(null);
    }
  }, [image]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only image files are allowed (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!image) return;

    setUpdating(true);

    try {
      await imagesAPI.updateImage(image._id, {
        title,
        image: file || undefined
      });
      
      toast.success('Image updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = (): void => {
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    onClose();
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Image</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={updating}
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
                    onLoad={() => {
                      if (preview.startsWith('blob:')) {
                        URL.revokeObjectURL(preview);
                      }
                    }}
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
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                disabled={updating}
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
              disabled={updating}
            />
            <p className="text-sm text-gray-500 mt-2">
              Click the icon to change image (max 5MB)
            </p>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Image Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter image title"
              required
              disabled={updating}
            />
          </div>

          {/* Image Info */}
          <div className="text-sm text-gray-500 space-y-1">
            {image.originalName && (
              <p>Original: {image.originalName}</p>
            )}
            {image.size && (
              <p>Size: {(image.size / 1024).toFixed(2)} KB</p>
            )}
            <p>Uploaded: {new Date(image.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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