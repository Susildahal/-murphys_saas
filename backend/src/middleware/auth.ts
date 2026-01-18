import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Invalid token format' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token, true);

    // Attach the decoded token (user info) to the request
    req.user = decodedToken;
    

    next();
  } catch (error: any) {
    console.error('Error verifying Firebase token:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ 
      error: 'Unauthorized: Invalid token',
      details: error.message 
    });
  }
};