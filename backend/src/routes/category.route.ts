import { Router } from 'express';
import { createCategory , updateCategory ,getCategories ,getCategoryById ,deleteCategory ,updateCategorystatus} from "../conttrolers/category.conttrolers"
const categoryrouter = Router();

categoryrouter.post("/categories", createCategory);
categoryrouter.get("/categories", getCategories);
categoryrouter.get("/categories/:id", getCategoryById);
categoryrouter.put("/categories/:id", updateCategory);
categoryrouter.delete("/categories/:id", deleteCategory);
categoryrouter.patch("/categories/:id", updateCategorystatus);

export default categoryrouter;