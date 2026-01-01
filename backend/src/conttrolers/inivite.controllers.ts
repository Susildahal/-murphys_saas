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
  try {
    const invites = await Invite.find({ invite_type: 'invite' });
    res.status(200).json({ data: invites, message: "Invites retrieved successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { email, response } = req.body;
    if (!email || !response) {
      return res.status(400).json({ message: 'Email and response are required' });
    }
    const invite = await Profile.findOne({ email: email, invite_type: 'invite' });
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: "Invalid response. Must be 'accepted' or 'rejected'" });
    }
    invite.inviteStatus = response;
    await invite.save();
    res.status(200).json({ data: invite, message: `Invite ${response} successfully` });
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
  



