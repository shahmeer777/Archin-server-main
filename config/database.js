import mongoose from 'mongoose';

// Centralized MongoDB connection manager
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.connection.readyState === 1) {
      console.log('🔄 Using existing MongoDB connection');
      return this.connection;
    }

    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection && this.connection.readyState === 1) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔒 MongoDB disconnected');
    }
  }

  getConnection() {
    return this.connection;
  }

  isReady() {
    return this.connection && this.connection.readyState === 1;
  }
}

// Export singleton instance
export const db = new DatabaseConnection();

// Handle process termination
process.on('SIGINT', async () => {
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});
