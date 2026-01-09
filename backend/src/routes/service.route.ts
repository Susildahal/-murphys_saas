import express from 'express';
import upload from '../middleware/upload';
import cloudinaryUpload from '../middleware/cloudinaryUpload';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '../conttrolers/service.conttolers';
import { verifyFirebaseToken } from '../middleware/auth';
import { checkPermission, Permission } from '../middleware/rbac';

const router = express.Router();

// All service routes require authentication
router.use(verifyFirebaseToken);

// List services
router.get('/services', getServices);

// Get single service
router.get('/services/:id', getServiceById);

// Create service (supports multipart form with field 'image')
router.post('/services', upload.single('image'), cloudinaryUpload, createService);

// Update service (supports new image upload)
router.put('/services/:id', upload.single('image'), cloudinaryUpload, updateService);

// Delete service
router.delete('/services/:id', deleteService);

export default router;
