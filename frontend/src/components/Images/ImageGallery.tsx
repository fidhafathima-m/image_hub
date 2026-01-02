import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, Save, CheckSquare, X } from "lucide-react";
import { imagesAPI } from "../../api/images";
import toast from "react-hot-toast";
import LoadingSpinner from "../Common/LoadingSpinner";
import ImageCard from "./ImageCard";
import EditModal from "./EditModal";
import { Image, SortableImageCardProps, ImageGalleryState } from "../../types/images";

// Add props interface
interface ImageGalleryProps {
  onEdit?: (image: Image) => void;
  onDelete?: () => void;
  onStatsUpdate?: (stats: { totalImages: number; totalSize: string; recentUploads: number }) => void;
}

// Sortable Item Component
const SortableImageCard: React.FC<SortableImageCardProps> = ({
  id,
  image,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ImageCard
        image={image}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelect={onSelect}
        isSelected={isSelected}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  );
};

// Update component to accept props
const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  onEdit, 
  onDelete,
  onStatsUpdate 
}) => {
  const [state, setState] = useState<ImageGalleryState>({
    images: [],
    loading: true,
    selectedImages: new Set(),
    selectionMode: false,
    editingImage: null,
    rearranged: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use ref for onStatsUpdate to avoid infinite re-renders
  const onStatsUpdateRef = useRef(onStatsUpdate);
  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  const fetchImages = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await imagesAPI.getImages();
      setState(prev => ({ ...prev, images: data, loading: false }));
      
      // Calculate and send stats if callback provided
      if (onStatsUpdateRef.current) {
        const totalSize = data.reduce((acc, img) => acc + (img.size || 0), 0);
        const recentUploads = data.filter(img => {
          const uploadDate = new Date(img.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length;
        
        onStatsUpdateRef.current({
          totalImages: data.length,
          totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
          recentUploads
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch images");
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setState(prev => {
        const oldIndex = prev.images.findIndex((item) => item._id === active.id);
        const newIndex = prev.images.findIndex((item) => item._id === over.id);

        const newItems = arrayMove(prev.images, oldIndex, newIndex);

        // Update order locally
        newItems.forEach((item, index) => {
          item.order = index;
        });

        return { ...prev, images: newItems, rearranged: true };
      });
    }
  };

  const handleSelectImage = (imageId: string, isSelected: boolean): void => {
    setState(prev => {
      const newSelected = new Set(prev.selectedImages);
      if (isSelected) {
        newSelected.add(imageId);
      } else {
        newSelected.delete(imageId);
      }
      return { ...prev, selectedImages: newSelected };
    });
  };

  const handleSelectAll = (): void => {
    setState(prev => {
      if (prev.selectedImages.size === prev.images.length) {
        return { ...prev, selectedImages: new Set() };
      } else {
        return { ...prev, selectedImages: new Set(prev.images.map(img => img._id)) };
      }
    });
  };

  const handleDeleteSelected = async (): Promise<void> => {
    const { selectedImages, images } = state;
    
    if (selectedImages.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedImages.size} selected image${selectedImages.size === 1 ? '' : 's'}?`)) {
      try {
        const deletePromises = Array.from(selectedImages).map((id) =>
          imagesAPI.deleteImage(id)
        );

        await Promise.all(deletePromises);

        toast.success(`${selectedImages.size} image${selectedImages.size === 1 ? '' : 's'} deleted successfully`);
        setState(prev => ({ 
          ...prev, 
          selectedImages: new Set(),
          selectionMode: false 
        }));
        fetchImages();
        // Call onDelete callback if provided
        if (onDelete) {
          onDelete();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete images");
      }
    }
  };

  const handleSaveOrder = async (): Promise<void> => {
    try {
      const imageOrder = state.images.map((img) => img._id);
      await imagesAPI.rearrangeImages(imageOrder);
      setState(prev => ({ ...prev, rearranged: false }));
      toast.success("Image order saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save image order");
    }
  };

  const handleEdit = (image: Image): void => {
    // Call onEdit callback if provided, otherwise use internal state
    if (onEdit) {
      onEdit(image);
    } else {
      setState(prev => ({ ...prev, editingImage: image }));
    }
  };

  const handleDelete = (): void => {
    fetchImages();
    // Clear selection after delete
    setState(prev => ({ ...prev, selectedImages: new Set() }));
    // Call onDelete callback if provided
    if (onDelete) {
      onDelete();
    }
  };

  const handleEditSuccess = (): void => {
    fetchImages();
    setState(prev => ({ ...prev, editingImage: null }));
  };

  const { images, loading, selectedImages, selectionMode, editingImage, rearranged } = state;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Images</h1>
          <p className="text-gray-600">
            {images.length} image{images.length !== 1 ? 's' : ''}
            {selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selection Controls */}
          {selectionMode ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                {selectedImages.size === images.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedImages.size === 0}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  selectionMode: false,
                  selectedImages: new Set()
                }))}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setState(prev => ({ ...prev, selectionMode: true }))}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              <CheckSquare className="h-5 w-5" />
              <span>Select</span>
            </button>
          )}

          {/* Save Order Button */}
          {rearranged && (
            <button
              onClick={handleSaveOrder}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Save Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery - Always grid view */}
      {images.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
          <div className="inline-block p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full mb-4">
            <Upload className="h-16 w-16 text-primary-500" />
          </div>
          <h3 className="text-2xl font-medium text-gray-800 mb-3">
            No images yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Upload your first image to create your personal image gallery
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img._id)}
            strategy={rectSortingStrategy}
          >
            {/* Fixed grid layout without view mode toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <SortableImageCard
                  key={image._id}
                  id={image._id}
                  image={image}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={handleSelectImage}
                  isSelected={selectedImages.has(image._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Modal - Only show if using internal state */}
      {!onEdit && editingImage && (
        <EditModal
          isOpen={!!editingImage}
          image={editingImage}
          onClose={() => setState(prev => ({ ...prev, editingImage: null }))}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ImageGallery;