import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${mongoUri}`);
  } catch (error) {
    console.warn(
      `[Database] Warning: Could not connect to MongoDB at ${mongoUri}. (Ensure MongoDB is running via docker-compose or locally)`
    );
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Fatal MongoDB error in production:', error);
      process.exit(1);
    }
  }
};
