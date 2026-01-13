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
profilerouter.get("/profiles/types", isAdmin, getAdminProfiles);
profilerouter.get("/profiles/:id", isOwnerOrAdmin, getProfileById);
profilerouter.get("/profiles/email/:email", isOwnerOrAdmin, getProfileByEmail);
profilerouter.put("/profiles/:id", isOwnerOrAdmin, upload.single('profile_image'), cloudinaryUpload, updateProfile);
profilerouter.delete("/profiles/:id", deleteProfile);

// Email route (admin only)
profilerouter.post("/send-email", isAdmin, sentemail);
profilerouter.post("/profiles/permissions/toggle", isAdmin, toggleUserPermission);
profilerouter.post("/profiles/permissions/role", isAdmin, updateUserRole);
profilerouter.post("/profiles/permissions/status", isAdmin, updateUserStatus);
profilerouter.get("/profiles/permissions/:userId", isAdmin, getUserPermissions);

export default profilerouter;   