import mongoose from 'mongoose';

const userDocumentSchema = new mongoose.Schema({
  name: String,
  size: Number,
  path: String
});

export const UserDocument = mongoose.model('UserDocument', userDocumentSchema);
