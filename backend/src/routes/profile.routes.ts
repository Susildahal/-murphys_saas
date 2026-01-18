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
import { verifyFirebaseToken } from "../middleware/auth";
// import { isAdmin, isOwnerOrAdmin, checkPermission, Permission } from "../middleware/rbac";

const profilerouter = Router();

// Public routes (no authentication required)
profilerouter.post("/profiles", upload.single('profile_image'), cloudinaryUpload, verifyFirebaseToken, createProfile);

// Protected routes (authentication required)
profilerouter.get("/profiles", verifyFirebaseToken, getProfiles);
profilerouter.get("/profiles/types", verifyFirebaseToken, getAdminProfiles);
profilerouter.get("/profiles/:id", verifyFirebaseToken, getProfileById);
profilerouter.get("/profiles/email/:email", verifyFirebaseToken, getProfileByEmail);
profilerouter.put("/profiles/:id", verifyFirebaseToken, upload.single('profile_image'), cloudinaryUpload, updateProfile);
profilerouter.delete("/profiles/:id", verifyFirebaseToken, deleteProfile);

// Email route (admin only)
profilerouter.post("/send-email", verifyFirebaseToken, sentemail);
profilerouter.post("/profiles/permissions/toggle", verifyFirebaseToken, toggleUserPermission);
profilerouter.post("/profiles/permissions/role", verifyFirebaseToken, updateUserRole);
profilerouter.post("/profiles/permissions/status", verifyFirebaseToken, updateUserStatus);
profilerouter.get("/profiles/permissions/:userId", verifyFirebaseToken, getUserPermissions);

export default profilerouter;   