import mongoose from 'mongoose';

const uploadedImageSchema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});

export const UploadedImage = mongoose.model('UploadedImage', uploadedImageSchema);
