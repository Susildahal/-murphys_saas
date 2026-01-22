import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemiller";
import Profile from "../models/profile.model";

/**
 * Step 1: Send verification email (before registration)
 * POST /api/auth/send-verification
 */
export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email already exists
    const existingProfile = await Profile.findOne({ email });
    if (existingProfile) {
      return res.status(409).json({ 
        message: "This email is already registered. Please login instead." 
      });
    }

    // Generate email verification token
    const verificationToken = jwt.sign(
      { 
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        step: 'email-verification'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // 1 hour for email verification
    );

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/complete-registration?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email to Complete Registration',
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
              <h2>Hi${firstName ? ` ${firstName}` : ''},</h2>
              <p>Thank you for starting your registration! Please verify your email address to continue.</p>
              <p>Click the button below to verify your email and complete your registration:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email & Continue</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this email, please ignore it.</p>
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
      message: "Verification email sent! Please check your inbox.",
      email
    });

  } catch (error: any) {
    console.error("Send verification email error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send verification email", 
      error: error.message 
    });
  }
};

/**
 * Step 2: Verify token and check if email is verified
 * GET /api/auth/verify-token?token=...
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { email: string; firstName?: string; lastName?: string; step: string };

    // Check if email already registered
    const existingProfile = await Profile.findOne({ email: decoded.email });
    if (existingProfile) {
      return res.status(409).json({ 
        success: false,
        message: "This email is already registered. Please login instead.",
        alreadyRegistered: true
      });
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      }
    });

  } catch (error: any) {
    console.error("Verify token error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false,
        message: "Verification link has expired. Please start registration again." 
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
      message: "Token verification failed", 
      error: error.message 
    });
  }
};

export * from "./auth.controllers";
