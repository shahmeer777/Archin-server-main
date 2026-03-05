import mongoose from 'mongoose';

// Chambre Oui2
const uploadedImageChambreOui2Schema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});
export const UploadedImageChambreOui2 = mongoose.model('UploadedImageChambreOui2', uploadedImageChambreOui2Schema);