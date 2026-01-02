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
      role: body.role,
      status: body.status,
      usertypes: body.usertypes
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


export const sentemail = async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  
  try {
    // Create styled HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      ${subject}
                    </h1>
                  </td>
                </tr>
                
                <!-- Body Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="color: #333333; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">
                      ${body}
                    </div>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 30px;">
                    <div style="border-top: 1px solid #e5e7eb;"></div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #f9fafb;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                      This email was sent from your Murphys Client account.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Your Company. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
              <!-- Bottom Spacing -->
              <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: center; padding: 20px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      If you have any questions, please don't hesitate to contact us.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      text: body, // Plain text fallback
      html: htmlTemplate // Beautiful HTML version
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};


