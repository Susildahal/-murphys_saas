import Profile from "../models/profile.model";
import { Request, Response } from "express";
import transporter from "../config/nodemiller";


export const createProfile = async (req: Request, res: Response) => {
  try {
    const body = req.body as any;
    const email = body?.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const ifemailesist = await Profile.findOne({ email: email });
    if (ifemailesist) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const uploadimageUrl = body.profile_image || body.imageUrl;


    // Build profile data, prefer image data attached by cloudinaryUpload middleware
    const profileData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName,
      email,
      phone: body.phone,
      bio: body.bio,
      city: body.city,
      country: body.country,
      dob: body.dob,
      doj: body.doj,
      gender: body.gender,
      position: body.position,
      state: body.state,
      website: body.website,
      profile_image: body.profile_image || body.imageUrl || undefined,
      public_id: body.public_id || undefined,
    };

    const profile = new Profile(profileData);
    await profile.save();
    res.status(201).json({ data: profile, message: "Profile created successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const inviteStatus = req.query.inviteStatus as string | undefined;

  try {
    const email = req.query.email as string | undefined;
    if (email) {
      const profile = await Profile.findOne({ email: email });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.status(200).json({ data: profile });
    } else {
      const filter: any = {};
      if (inviteStatus) {
        filter.inviteStatus = inviteStatus;
      }
      const [total, profiles] = await Promise.all([
        Profile.countDocuments(filter),
        Profile.find(filter).skip(skip).limit(limit)
      ]);
      return res.status(200).json({
        data: profiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const body = req.body as any;

    // Build update data object
    const updateData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName,
      email: body.email,
      phone: body.phone,
      bio: body.bio,
      city: body.city,
      country: body.country,
      dob: body.dob,
      doj: body.doj,
      gender: body.gender,
      position: body.position,
      state: body.state,
      website: body.website,
    };

    // Only update image fields if a new image was uploaded
    if (body.profile_image) {
      updateData.profile_image = body.profile_image;
    }
    if (body.public_id) {
      updateData.public_id = body.public_id;
    }

    const profile = await Profile.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json({ data: profile, message: "Profile updated successfully" });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inviteusers = async (req: Request, res: Response) => {
  try {
    const {email , invite_by} = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const ifemailesist = await Profile.findOne({ email: email });
    if (ifemailesist) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const inviteby =await Profile.findOne({ email: invite_by });
    if (!inviteby) {
      return res.status(404).json({ message: "Inviter profile not found" });
    }


    const profile = new Profile({
      email: email,
      invite_type: 'invite',
      invite_email: invite_by,
      inviteStatus: 'pending'
    });
    await profile.save();
    // Send invitation email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'You are invited to join Murphys Client',
      text: `Hello,
You have been invited to join Murphys Client. Please click the link below to accept the invitation:
http://your-frontend-url.com/accept-invite?email=${encodeURIComponent(email)}
Best regards,
Murphys Client Team`
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({ data: profile, message: "Invitation sent successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }



};