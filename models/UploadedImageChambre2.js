import mongoose from 'mongoose';

// Chambre2
const uploadedImageChambre2Schema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});
export const UploadedImageChambre2 = mongoose.model('UploadedImageChambre2', uploadedImageChambre2Schema);
