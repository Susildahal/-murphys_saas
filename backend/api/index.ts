import serverless from 'serverless-http';
import app from '../src/index';
import connectDB from '../src/config/connectdb';
import mongoose from 'mongoose';

let handler: any = null;

export default async function (req: any, res: any) {
  // Connect to database on each cold start
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await connectDB();
    }
  } catch (err) {
    console.error('DB connection failed in serverless handler:', err);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }

  if (!handler) {
    handler = serverless(app as any);
  }

  return handler(req, res);
}
