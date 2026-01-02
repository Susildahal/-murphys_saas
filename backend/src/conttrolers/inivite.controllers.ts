import Invite from "../models/invite.model";
import { Request, Response } from "express";
import transporter from "../config/nodemiller";
import Profile from "../models/profile.model";
import dotenv from "dotenv";
dotenv.config()


export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, invite_email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const existingInvite = await Profile.findOne({ email: email });
    if (existingInvite) {
      return res.status(409).json({ message: "An invite has already been sent to this email" });
    }
    const invite = new Invite({
      email,
      firstName,
      lastName,
      invite_type: 'invite',
      invite_email: invite_email,
      inviteStatus: 'pending',
    });
    await invite.save();
    // Send invitation email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'You are invited to join Murphys Client',
      text: `Hello ${firstName || ''} ${lastName || ''},
You have been invited to join Murphys Client. Please click the link below to accept the invitation:
${process.env.createaccoutroutes}?email=${encodeURIComponent(email)}
Best regards,
Murphys Client Team`
    });
    res.status(201).json({ data: invite, message: "Invitation sent successfully" });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getInvites = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 1;
  const skip = (page - 1) * limit;

  try {
    const total = await Invite.countDocuments( );
    const invites = await Invite.find({ invite_type: 'invite' }).skip(skip).limit(limit);
    res.status(200).json({ data: invites, 
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
       message: "Invites retrieved successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { email } = req.body; 
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const invite = await Invite.findOne({ email: email, invite_type: 'invite' });
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    invite.inviteStatus = 'accepted';
    await invite.save();
    res.status(200).json({ data: invite, message: "Invite accepted successfully" });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const rejectInvite = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const invite = await Invite.findOne({ email: email, invite_type: 'invite' });
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    invite.inviteStatus = 'rejected';
    await invite.save();
    res.status(200).json({ data: invite, message: "Invite rejected successfully" });
  }
  catch (error)
  {
    res.status(400).json({ message: (error as Error).message });
  }
  };
  

  export const updateInvite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const invite = await Invite.findByIdAndUpdate(id, updateData, { new: true });
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }
      res.status(200).json({ data: invite, message: "Invite updated successfully" });
    }
    catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

export const deleteInvite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invite = await Invite.findByIdAndDelete(id);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    res.status(200).json({ data: invite, message: "Invite deleted successfully" });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export  const inviteAgain = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const invite = await Invite.findById(id);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    const email = invite.email;
    // Resend invitation email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reminder: You are invited to join Murphys Client',
      text: `Hello ${invite.firstName || ''} ${invite.lastName || ''},
This is a reminder that you have been invited to join Murphys Client. Please click the link below to accept the invitation:
${process.env.createaccoutroutes}?email=${encodeURIComponent(invite.email)}
Best regards,
Murphys Client Team`
    });
    res.status(200).json({ data: invite, message: "Invitation resent successfully" });
  }
 catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};



