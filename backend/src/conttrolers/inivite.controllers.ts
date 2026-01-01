
import { Request, Response } from "express";
import transporter from "../config/nodemiller";
import Profile from "../models/profile.model";


export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName,invite_by } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const existingInvite = await Profile.findOne({ email: email });
    if (existingInvite) {
      return res.status(409).json({ message: "An invite has already been sent to this email" });
    }
    const invite = new Profile({
      email,
      firstName,
        lastName,
        invite_type: 'invite',
        invite_email: email,
        invite_by: invite_by,
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
http://your-frontend-url.com/accept-invite?email=${encodeURIComponent(email)}
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
    const invites = await Profile.find({ invite_type: 'invite' });
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


