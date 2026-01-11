import serverless from 'serverless-http';
import app from '../src/index';
import connectDB from '../src/config/connectdb';

let handler: any = null;
let isConnected = false;

export default async function (req: any, res: any) {
  // Set CORS headers for all requests in serverless environment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isConnected) {
    // ensure DB connection once per serverless instance
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('DB connection failed in serverless handler', err);
      res.status(500).send('Database connection error');
      return;
    }
  }

  if (!handler) {
    handler = serverless(app as any);
  }

  return handler(req, res);
}
