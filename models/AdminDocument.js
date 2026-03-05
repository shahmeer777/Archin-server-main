import mongoose from 'mongoose';

const adminDocumentSchema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});

export const AdminDocument = mongoose.model('AdminDocument', adminDocumentSchema);
