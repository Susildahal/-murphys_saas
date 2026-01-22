import { Request, Response } from "express";
import Profile from "../models/profile.model";
import { AuthenticatedRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemiller";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      gender, 
      phone,
      country,
      referralSource 
    } = req.body;

    // Get Firebase user from verified token
    const firebaseUser = req.user;
    
    if (!firebaseUser) {
      return res.status(401).json({ message: "Unauthorized - Firebase authentication required" });
    }

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ 
        message: "Required fields missing: firstName, lastName, and email are required" 
      });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ 
      $or: [{ email }, { userId: firebaseUser.uid }] 
    });

    if (existingProfile) {
      return res.status(409).json({ 
        message: "User already registered with this email or Firebase account" 
      });
    }

    // Create new profile (already verified via email token)
    const profileData = {
      userId: firebaseUser.uid,
      firstName,
      lastName,
      email,
      phone: phone || '',
      gender: gender || '',
      country: country || 'Australia',
      referralSource: referralSource || '',
      role_type: 'client user',
      status: 'active', // Active immediately since email was verified before registration
      usertypes: 'client'
    };

    const newProfile = new Profile(profileData);
    await newProfile.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newProfile._id,
        userId: newProfile.userId,
        firstName: newProfile.firstName,
        lastName: newProfile.lastName,
        email: newProfile.email,
        phone: newProfile.phone,
        gender: newProfile.gender,
        country: newProfile.country
      }
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Registration failed", 
      error: error.message 
    });
  }
};

/**
 * Verify email with JWT token
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: string; email: string; profileId: string };

    // Find and update profile
    const profile = await Profile.findById(decoded.profileId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.status === 'active') {
      return res.status(200).json({ 
        success: true,
        message: "Email already verified",
        alreadyVerified: true
      });
    }

    // Update profile status to active
    profile.status = 'active';
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Your account is now active.",
      data: {
        id: profile._id,
        email: profile.email,
        status: profile.status
      }
    });

  } catch (error: any) {
    console.error("Email verification error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false,
        message: "Verification link has expired. Please request a new one." 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid verification token." 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Email verification failed", 
      error: error.message 
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerificationEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    const firebaseUser = req.user;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find profile
    const profile = await Profile.findOne({ email });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.status === 'active') {
      return res.status(200).json({ 
        success: true,
        message: "Email already verified",
        alreadyVerified: true
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { 
        userId: profile.userId, 
        email: profile.email,
        profileId: profile._id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hi ${profile.firstName},</h2>
              <p>You requested a new verification link. Click the button below to verify your email:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Murphy's SaaS. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Verification email sent! Please check your inbox."
    });

  } catch (error: any) {
    console.error("Resend verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to resend verification email", 
      error: error.message 
    });
  }
};

/**
 * Check if user exists
 * GET /api/auth/check-user?email=...
 */
export const checkUserExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email parameter required" });
    }

    const profile = await Profile.findOne({ email: email as string });

    res.status(200).json({
      exists: !!profile,
      profile: profile ? {
        id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      } : null
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const firebaseUser = req.user;

    if (!firebaseUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await Profile.findOne({ userId: firebaseUser.uid }).populate('role');

    if (!profile) {
      return res.status(404).json({ 
        message: "Profile not found",
        userId: firebaseUser.uid 
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
