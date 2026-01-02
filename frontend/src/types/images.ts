import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Transform } from '@dnd-kit/utilities';

// Image Types
export interface Image {
  _id: string;
  title: string;
  url: string;
  fileName: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
  order: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageFile {
  file: File;
  preview: string;
  title: string;
}

// Modal Props
export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Image | null;
  onSuccess: () => void;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Image Card Props
export interface ImageCardProps {
  image: Image;
  onEdit: (image: Image) => void;
  onDelete: () => void;
  onSelect: (imageId: string, isSelected: boolean) => void;
  isSelected: boolean;
  isDragging?: boolean;
  dragListeners?: any;
}

// Sortable Image Card Props
export interface SortableImageCardProps extends Omit<ImageCardProps, 'isDragging' | 'dragListeners'> {
  id: string;
}

// DnD Types
export interface DnDEvent {
  active: { id: string };
  over: { id: string } | null;
}

// Image Gallery State
export interface ImageGalleryState {
  images: Image[];
  loading: boolean;
  selectedImages: Set<string>;
  selectionMode: boolean;
  editingImage: Image | null;
  rearranged: boolean;
}