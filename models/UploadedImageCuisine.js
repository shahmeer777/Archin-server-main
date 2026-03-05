import mongoose from 'mongoose';

// Cuisine
const uploadedImageCuisineSchema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});
export const UploadedImageCuisine = mongoose.model('UploadedImageCuisine', uploadedImageCuisineSchema);
