import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
import ImageCard from "./Imagecard";
import EditModal from "./EditModal";

// Sortable Item Component
const SortableImageCard = ({
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
  } = useSortable({ id: image._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [rearranged, setRearranged] = useState(false);

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

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await imagesAPI.getImages();
      setImages(data);
    } catch (error) {
      toast.error("Failed to fetch images", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order locally
        newItems.forEach((item, index) => {
          item.order = index;
        });

        setRearranged(true);
        return newItems;
      });
    }
  };

  const handleSelectImage = (imageId, isSelected) => {
    const newSelected = new Set(selectedImages);

    if (isSelected) {
      newSelected.add(imageId);
    } else {
      newSelected.delete(imageId);
    }

    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img._id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedImages.size} selected images?`
      )
    ) {
      try {
        const deletePromises = Array.from(selectedImages).map((id) =>
          imagesAPI.deleteImage(id)
        );

        await Promise.all(deletePromises);

        toast.success(`${selectedImages.size} images deleted successfully`);
        setSelectedImages(new Set());
        fetchImages();
      } catch (error) {
        toast.error("Failed to delete some images", error);
      }
    }
  };

  const handleSaveOrder = async () => {
    try {
      const imageOrder = images.map((img) => img._id);
      await imagesAPI.rearrangeImages(imageOrder);
      setRearranged(false);
      toast.success("Image order saved successfully");
    } catch (error) {
      toast.error("Failed to save image order", error);
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
  };

  const handleDelete = () => {
    fetchImages();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Images</h1>
          <p className="text-gray-600">{images.length} images</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Selection Controls */}
          {selectionMode ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedImages.size} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {selectedImages.size === images.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedImages.size === 0}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedImages(new Set());
                }}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectionMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <CheckSquare className="h-5 w-5" />
              <span>Select</span>
            </button>
          )}

          {/* Save Order Button */}
          {rearranged && (
            <button
              onClick={handleSaveOrder}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="h-5 w-5" />
              <span>Save Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-8 bg-gray-100 rounded-full mb-4">
            <Upload className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No images yet
          </h3>
          <p className="text-gray-500">
            Upload your first image to get started
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <SortableImageCard
                  key={image._id}
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

      {editingImage && (
        <EditModal
          isOpen={true}
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSuccess={fetchImages}
        />
      )}
    </div>
  );
};

export default ImageGallery;
