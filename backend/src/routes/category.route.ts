import { Router } from 'express';
import { createCategory , updateCategory ,getCategories ,getCategoryById ,deleteCategory ,updateCategorystatus} from "../conttrolers/category.conttrolers"
const categoryrouter = Router();
import { verifyFirebaseToken } from "../middleware/auth";
import {checkPermission, Permission} from "../middleware/rbac";
import {isAdmin} from "../middleware/rbac";

// All category routes require authentication
    // categoryrouter.use(verifyFirebaseToken);

categoryrouter.post("/categories", verifyFirebaseToken, isAdmin, createCategory);
categoryrouter.get("/categories", verifyFirebaseToken, getCategories);
categoryrouter.get("/categories/:id", verifyFirebaseToken, getCategoryById);
categoryrouter.put("/categories/:id", verifyFirebaseToken, isAdmin, updateCategory);
categoryrouter.delete("/categories/:id", verifyFirebaseToken, isAdmin, deleteCategory);
categoryrouter.patch("/categories/:id", verifyFirebaseToken, isAdmin, updateCategorystatus);

export default categoryrouter;