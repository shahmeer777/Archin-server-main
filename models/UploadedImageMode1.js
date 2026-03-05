import mongoose from 'mongoose';

// Mode1
const uploadedImageMode1Schema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});
export const UploadedImageMode1 = mongoose.model('UploadedImageMode1', uploadedImageMode1Schema);