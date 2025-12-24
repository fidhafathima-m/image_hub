import React, { useState } from "react";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
  GripVertical,
} from "lucide-react";
import { imagesAPI } from "../../api/images";
import toast from "react-hot-toast";

const ImageCard = ({
  image,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  isDragging,
  dragListeners,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await imagesAPI.deleteImage(image._id);
        toast.success("Image deleted successfully");
        onDelete();
      } catch (error) {
        toast.error("Failed to delete image", error);
      }
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isSelected ? "ring-2 ring-primary-500" : ""
      } ${isDragging ? "opacity-50" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        {...dragListeners}
        className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing bg-white/80 rounded p-1"
        title="Drag to reorder"
      >
        <GripVertical className="h-5 w-5 text-gray-600" />
      </div>

      {/* Checkbox for selection */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(image._id, e.target.checked)}
          className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {image.url ? (
          <img
            src={imagesAPI.getImageUrl(image.fileName)}
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 truncate">{image.title}</h3>
        <p className="text-sm text-gray-500">
          {new Date(image.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
          <button
            onClick={() => onEdit(image)}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Pencil className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
