import { Router } from "express";
import { 
  createProfile, 
  getProfiles, 
  getProfileById, 
  updateProfile, 
  sentemail, 
  getProfileByEmail, 
  deleteProfile, 
  getAdminProfiles,
  toggleUserPermission,
  updateUserRole,
  updateUserStatus,
  getUserPermissions
} from "../conttrolers/profile.conttrolers";
import upload from "../middleware/upload";
import cloudinaryUpload from "../middleware/cloudinaryUpload";
// import { verifyFirebaseToken } from "../middleware/auth";
import { isAdmin, isOwnerOrAdmin, checkPermission, Permission } from "../middleware/rbac";

const profilerouter = Router();

// Public routes (no authentication required)
profilerouter.post("/profiles", upload.single('profile_image'), cloudinaryUpload, createProfile);

// Protected routes (authentication required)
profilerouter.get("/profiles",  getProfiles);
profilerouter.get("/profiles/types",  getAdminProfiles);
profilerouter.get("/profiles/:id",  getProfileById);
profilerouter.get("/profiles/email/:email",  getProfileByEmail);
profilerouter.put("/profiles/:id",  upload.single('profile_image'), cloudinaryUpload, updateProfile);
profilerouter.delete("/profiles/:id", deleteProfile);

// Email route (admin only)
profilerouter.post("/send-email", sentemail);
profilerouter.post("/profiles/permissions/toggle", toggleUserPermission);
profilerouter.post("/profiles/permissions/role", updateUserRole);
profilerouter.post("/profiles/permissions/status", updateUserStatus);
profilerouter.get("/profiles/permissions/:userId", getUserPermissions);

export default profilerouter;   