import { Router } from "express";
import { createProfile, getProfiles, getProfileById  ,updateProfile ,sentemail } from "../conttrolers/profile.conttrolers";
import upload from "../middleware/upload";
import cloudinaryUpload from "../middleware/cloudinaryUpload";
const profilerouter = Router();

// Use Multer to accept a single file under 'profile_image', then upload to Cloudinary
profilerouter.post("/profiles", upload.single('profile_image'), cloudinaryUpload, createProfile);
profilerouter.get("/profiles", getProfiles);
profilerouter.get("/profiles/:id", getProfileById);
profilerouter.put("/profiles/:id", upload.single('profile_image'), cloudinaryUpload, updateProfile);
profilerouter.post("/send-email", sentemail);


export default profilerouter;


