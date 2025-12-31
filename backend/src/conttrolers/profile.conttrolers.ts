import Profile from "../models/profile.routes";
import { Request, Response } from "express";

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

  try {
    const email = req.query.email as string | undefined;
    if (email) {
      const profile = await Profile.findOne({ email: email });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.status(200).json({ data: profile });
    } else {
      const [total, profiles] = await Promise.all([
        Profile.countDocuments(),
        Profile.find().skip(skip).limit(limit)
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
        res.status(200).json({ data: profile , message: "Profile updated successfully" });
    }
    catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};