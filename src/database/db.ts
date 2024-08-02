import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://hamza:hamza@cluster0.zcbj6k5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',

      {
        dbName: 'MegBattle',
      }
    );
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
