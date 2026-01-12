import serverless from 'serverless-http';
import app from '../src/index';
import connectDB from '../src/config/connectdb';

let handler: any = null;
let isConnected = false;

export default async function (req: any, res: any) {
  // CORS handling: prefer an explicit allowlist via env var; otherwise echo origin when present.
  // When allowing credentials, Access-Control-Allow-Origin must NOT be '*'.
  const requestOrigin = req.headers && req.headers.origin;
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let originToSet: string | undefined;
  let allowCredentials = true;

  if (allowedOrigins.length > 0) {
    // If there's an allowlist, only echo back allowed origins
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      originToSet = requestOrigin;
    } else {
      // Not an allowed origin: do not set credentials and fall back to first allowed origin
      originToSet = allowedOrigins[0];
      allowCredentials = false;
    }
  } else {
    // No allowlist configured: echo the request origin when available. If no origin, fall back to '*'
    if (requestOrigin) originToSet = requestOrigin;
    else {
      originToSet = '*';
      // When using '*', we cannot allow credentials
      allowCredentials = false;
    }
  }

  if (originToSet) res.setHeader('Access-Control-Allow-Origin', originToSet);
  if (allowCredentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    // For preflight responses it's OK to end with 204
    res.status(204).end();
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
