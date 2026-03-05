import dotenv from 'dotenv';
import { db } from './config/database.js';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    await db.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const mongoose = db.getConnection();
    if (mongoose) {
      console.log('📊 Connection state:', mongoose.connection.readyState);
    }
    
    await db.disconnect();
    console.log('🔒 Test completed - disconnected successfully');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
};

testConnection();
