import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IImage extends Document {
  _id: ObjectId;
  user: string;
  title?: string;
  publicId: string;
  url: string;
  thumbnailUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}