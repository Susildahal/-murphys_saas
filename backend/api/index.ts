import serverless from 'serverless-http';
import app from '../src/index';
import connectDB from '../src/config/connectdb';

let handler: any = null;
let isConnected = false;

export default async function (req: any, res: any) {
  // Let the Express app handle CORS (via the cors middleware) to avoid duplicate/conflicting headers.
  // Do not set CORS headers here. Just let the wrapped app handle the request.

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
