import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';
import * as jwt from 'jsonwebtoken';
import Auth from '../models/auth';

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

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    const id = (decodedToken as any).userId;

    if (!id) {
      res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
      return;
    }
   const user = await Auth.findById(id);
   if (!user) {
      res.status(401).json({ error: 'Unauthorized: User not found' });
      return;
   }

    // Attach the decoded token (user info) to the request
    req.user = { uid: user._id.toString() ,email: user.email } as admin.auth.DecodedIdToken;
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