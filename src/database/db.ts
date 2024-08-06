// database/db.ts
import mongoose, { Mongoose } from 'mongoose';

let client: Mongoose | null = null;

export const connectDB = async () => {
  try {
    client = await mongoose.connect(
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

export const getClient = (): Mongoose | null => client;
