import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: Number , required: true, unique: true },
  userName: String,
  userEmail: { type: String, unique: true, required: true }
});

export const User = mongoose.model('User', userSchema);
