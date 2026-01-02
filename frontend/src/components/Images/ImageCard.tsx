import React, { useState, ChangeEvent } from "react";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { imagesAPI } from "../../api/images";
import toast from "react-hot-toast";
import { ImageCardProps } from "../../types/images";

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  isDragging = false,
  dragListeners,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;
    
    if (window.confirm(`Are you sure you want to delete "${image.title}"?`)) {
      setIsDeleting(true);
      try {
        await imagesAPI.deleteImage(image._id);
        toast.success("Image deleted successfully");
        onDelete();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete image");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSelectChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onSelect(image._id, e.target.checked);
  };

  const handleEditClick = (): void => {
    onEdit(image);
  };

  const imageUrl = imagesAPI.getImageUrl(image.fileName);

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary-500 ring-offset-2" : ""
      } ${isDragging ? "opacity-50 cursor-grabbing" : "cursor-pointer"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Don't trigger select when clicking on buttons
        if (!(e.target as HTMLElement).closest('button, input')) {
          onSelect(image._id, !isSelected);
        }
      }}
    >
      {/* Drag Handle */}
      {dragListeners && (
        <div
          {...dragListeners}
          className="absolute top-3 right-3 z-20 cursor-grab active:cursor-grabbing bg-white/90 hover:bg-white rounded-lg p-2 shadow-sm"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-gray-600" />
        </div>
      )}

      {/* Checkbox for selection */}
      <div 
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
        />
      </div>

      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center truncate w-full">
              {image.fileName}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 border-t">
        <h3 className="font-medium text-gray-800 truncate" title={image.title}>
          {image.title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {new Date(image.createdAt).toLocaleDateString()}
          </p>
          {image.size && (
            <span className="text-xs text-gray-500">
              {(image.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      </div>

      {/* Actions overlay */}
      {(isHovered || isSelected) && (
        <div 
          className="absolute inset-0 bg-black/70 flex items-center justify-center space-x-3 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditClick}
            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 shadow-lg"
            title="Edit"
            disabled={isDeleting}
          >
            <Pencil className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 bg-white rounded-full hover:bg-red-50 transition-all duration-200 hover:scale-110 shadow-lg"
            title="Delete"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="h-5 w-5 border-t-2 border-b-2 border-red-600 rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="h-5 w-5 text-red-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCard;